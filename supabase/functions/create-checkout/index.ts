import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutItem {
  id: string;
  cantidad: number;
}

interface CheckoutPayload {
  items: CheckoutItem[];
  cliente: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    calle: string;
    numero: string;
    piso?: string;
    codigo_postal: string;
    localidad: string;
  };
  coupon?: string;
  origin: string;
}

const ORIGIN_ADDRESS = "Calle Lictores, 41018 Sevilla, España";
const ORS_API_KEY = Deno.env.get("ORS_API_KEY") ?? "";
const ORS_BASE = "https://api.openrouteservice.org";

async function geocode(address: string): Promise<GeocodeResult> {
  const url = `${ORS_BASE}/geocode/search?text=${encodeURIComponent(address)}&size=1`;
  const res = await fetch(url, {
    headers: { Authorization: ORS_API_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Geocodificación fallida (${res.status})`);
  const data = await res.json();
  if (!data.features || data.features.length === 0) throw new Error("No se encontró la dirección de entrega.");
  const [lng, lat] = data.features[0].geometry.coordinates;
  const county = data.features[0].properties?.county ?? "";
  const municipality = data.features[0].properties?.municipality ?? "";
  return { lat, lng, county, municipality };
}

async function getDrivingDistance(origin: GeocodeResult, dest: GeocodeResult): Promise<number> {
  const res = await fetch(`${ORS_BASE}/v2/directions/driving-car`, {
    method: "POST",
    headers: { Authorization: ORS_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ coordinates: [[origin.lng, origin.lat], [dest.lng, dest.lat]], units: "km" }),
  });
  if (!res.ok) throw new Error(`Cálculo de ruta fallido (${res.status})`);
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) throw new Error("No se pudo calcular la ruta por carretera.");
  return data.routes[0].summary.distance;
}

const SEVILLA_CP_RANGE = new Set(
  Array.from({ length: 20 }, (_, i) => `410${String(i + 1).padStart(2, "0")}`),
);

function esSevillaCapital(codigoPostal: string, localidad: string): boolean {
  const cp = codigoPostal.trim();
  const loc = localidad.trim().toLowerCase();
  if (SEVILLA_CP_RANGE.has(cp)) return true;
  if (loc === "sevilla") return true;
  return false;
}

function calcularTarifaProvincia(distanciaKm: number, subtotal: number): { envio: number; disponible: boolean } {
  if (distanciaKm <= 6) return { envio: subtotal > 25 ? 0 : 2.0, disponible: true };
  if (distanciaKm <= 9) return { envio: subtotal > 25 ? 2.9 : 4.9, disponible: true };
  if (distanciaKm <= 18) return { envio: subtotal > 25 ? 4.9 : 6.9, disponible: true };
  return { envio: 0, disponible: false };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe no está configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const body: CheckoutPayload = await req.json();
    const { items, cliente, coupon, origin } = body;

    if (!items?.length || !cliente?.email) {
      return new Response(
        JSON.stringify({ error: "Faltan datos del carrito o del cliente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validar precios consultando la base de datos con la clave de servicio
    const productIds = items.map((i) => i.id);
    const query = `${supabaseUrl}/rest/v1/products?id=in.(${productIds.map(encodeURIComponent).join(",")})&select=id,nombre,precio,imagen`;
    const prodRes = await fetch(query, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    });

    if (!prodRes.ok) {
      return new Response(
        JSON.stringify({ error: "No se pudieron validar los productos." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const products: { id: string; nombre: string; precio: number; imagen: string }[] =
      await prodRes.json();

    if (products.length !== productIds.length) {
      return new Response(
        JSON.stringify({ error: "Uno o más productos no existen." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Construir line items con precios validados del servidor
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    let subtotal = 0;
    for (const item of items) {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) continue;
      const precioCentimos = Math.round(Number(prod.precio) * 100);
      subtotal += Number(prod.precio) * item.cantidad;

      const imagenUrl = prod.imagen
        ? (prod.imagen.startsWith("http") ? prod.imagen : `${origin}${prod.imagen}`)
        : undefined;

      lineItems.push({
        quantity: item.cantidad,
        price_data: {
          currency: "eur",
          unit_amount: precioCentimos,
          product_data: {
            name: prod.nombre,
            images: imagenUrl ? [imagenUrl] : undefined,
          },
        },
      });
    }

    // Validar y aplicar cupón de descuento
    let descuento = 0;
    let couponCodigo = "";
    if (coupon) {
      const couponQuery = `${supabaseUrl}/rest/v1/coupons?codigo=eq.${encodeURIComponent(coupon.toUpperCase())}&select=codigo,tipo,valor,activo,fecha_inicio,fecha_fin,usos_maximos,usos`;
      const couponRes = await fetch(couponQuery, {
        headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
      });
      if (couponRes.ok) {
        const couponData: { codigo: string; tipo: string; valor: number; activo: boolean; fecha_inicio: string; fecha_fin: string | null; usos_maximos: number | null; usos: number }[] = await couponRes.json();
        if (couponData.length > 0) {
          const c = couponData[0];
          const now = new Date();
          const vigente = c.activo && new Date(c.fecha_inicio) <= now && (!c.fecha_fin || new Date(c.fecha_fin) >= now) && (c.usos_maximos === null || c.usos < c.usos_maximos);
          if (vigente) {
            descuento = c.tipo === "porcentaje" ? (subtotal * Number(c.valor)) / 100 : Math.min(Number(c.valor), subtotal);
            descuento = Math.round(descuento * 100) / 100;
            couponCodigo = c.codigo;
            if (descuento > 0) {
              lineItems.push({
                quantity: 1,
                price_data: {
                  currency: "eur",
                  unit_amount: -Math.round(descuento * 100),
                  product_data: { name: `Descuento (${c.codigo})` },
                },
              });
            }
          }
        }
      }
    }

    // Calcular envío: Sevilla Capital vs Sevilla Provincia
    if (!cliente.localidad) {
      return new Response(
        JSON.stringify({ error: "Falta la localidad para calcular el envío." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const subtotalTrasDescuento = Math.max(0, subtotal - descuento);

    let envio = 0;
    let disponible = true;
    let distanciaKm = 0;
    let zona = "sevilla_capital";

    if (esSevillaCapital(cliente.codigo_postal, cliente.localidad)) {
      // Sevilla Capital: sin cálculo de kilómetros
      envio = subtotalTrasDescuento > 25 ? 0 : 2.0;
    } else {
      // Sevilla Provincia: calcular distancia por carretera
      if (!ORS_API_KEY) {
        return new Response(
          JSON.stringify({ error: "El servicio de cálculo de envío no está configurado." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const destAddress = `${cliente.calle} ${cliente.numero}, ${cliente.codigo_postal} ${cliente.localidad}, Sevilla, España`;
      const originCoords = await geocode(ORIGIN_ADDRESS);
      const destCoords = await geocode(destAddress);
      distanciaKm = await getDrivingDistance(originCoords, destCoords);

      const enProvinciaSevilla =
        destCoords.county?.toLowerCase().includes("sevilla") ||
        destCoords.municipality?.toLowerCase().includes("sevilla") ||
        cliente.codigo_postal.trim().startsWith("41");

      if (!enProvinciaSevilla) {
        return new Response(
          JSON.stringify({ error: "Lo sentimos, actualmente solo realizamos entregas en la provincia de Sevilla. Contáctanos por WhatsApp para alternativas." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      zona = "sevilla_provincia";
      const tarifa = calcularTarifaProvincia(distanciaKm, subtotalTrasDescuento);
      envio = tarifa.envio;
      disponible = tarifa.disponible;

      if (!disponible) {
        return new Response(
          JSON.stringify({ error: "Lo sentimos, no realizamos envíos a domicilio a destinos a más de 18 km de nuestra sede. Contáctanos por WhatsApp para alternativas." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (envio > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(envio * 100),
          product_data: {
            name: zona === "sevilla_capital"
              ? "Envío a domicilio (Sevilla Capital)"
              : `Envío a domicilio (${Math.round(distanciaKm * 100) / 100} km)`,
          },
        },
      });
    }

    // Crear pedido en Supabase como pendiente
    const orderPayload = {
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      telefono: cliente.telefono,
      email: cliente.email,
      calle: cliente.calle,
      numero: cliente.numero,
      piso: cliente.piso || "",
      codigo_postal: cliente.codigo_postal,
      localidad: cliente.localidad,
      distancia_km: Math.round(distanciaKm * 100) / 100,
      metodo_pago: "stripe",
      subtotal,
      descuento,
      envio,
      total: subtotalTrasDescuento + envio,
      estado: "pendiente",
    };

    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      return new Response(
        JSON.stringify({ error: "No se pudo crear el pedido." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orderData: { id: string }[] = await orderRes.json();
    const orderId = orderData[0].id;

    // Guardar items del pedido
    const itemPayload = items.map((item) => {
      const prod = products.find((p) => p.id === item.id)!;
      return {
        order_id: orderId,
        product_id: item.id,
        product_name: prod.nombre,
        cantidad: item.cantidad,
        precio_unitario: Number(prod.precio),
      };
    });

    await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemPayload),
    });

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pago-cancelado`,
      customer_email: cliente.email,
      metadata: {
        order_id: orderId,
        nombre: `${cliente.nombre} ${cliente.apellidos}`,
      },
      shipping_address_collection: {
        allowed_countries: ["ES"],
      },
    });

    // Guardar el ID de sesión en el pedido
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stripe_session_id: session.id }),
    });

    // Incrementar el uso del cupón
    if (couponCodigo) {
      const usageRes = await fetch(`${supabaseUrl}/rest/v1/coupons?codigo=eq.${encodeURIComponent(couponCodigo)}&select=usos`, {
        headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
      });
      if (usageRes.ok) {
        const usageData: { usos: number }[] = await usageRes.json();
        if (usageData.length > 0) {
          await fetch(`${supabaseUrl}/rest/v1/coupons?codigo=eq.${encodeURIComponent(couponCodigo)}`, {
            method: "PATCH",
            headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ usos: usageData[0].usos + 1 }),
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
