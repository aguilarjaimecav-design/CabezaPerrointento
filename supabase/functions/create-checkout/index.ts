import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const REDSYS_MERCHANT_CODE = Deno.env.get("REDSYS_MERCHANT_CODE") ?? "372934588";
const REDSYS_TERMINAL = Deno.env.get("REDSYS_TERMINAL") ?? "1";
const REDSYS_CURRENCY = "978";
const REDSYS_TEST_URL = "https://sis-t.redsys.es:25443/sis/realizarPago"

async function signRedsysRequest(merchantParameters: string, secretKey: string): Promise<string> {
  const keyData = atob(secretKey);
  const keyBytes = new Uint8Array(keyData.length);
  for (let i = 0; i < keyData.length; i++) keyBytes[i] = keyData.charCodeAt(i);
  const enc = new TextEncoder();
  const data = enc.encode(merchantParameters);
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const sigBytes = new Uint8Array(sigBuf);
  let computed = "";
  for (let i = 0; i < sigBytes.length; i++) computed += String.fromCharCode(sigBytes[i]);
  return btoa(computed);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutItem {
  id: string;
  cantidad: number;
  variante_formato?: string;
  variante_precio?: number;
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
  if (distanciaKm <= 6) return { envio: subtotal >= 25 ? 0 : 2.0, disponible: true };
  if (distanciaKm <= 9) return { envio: subtotal >= 25 ? 2.9 : 4.9, disponible: true };
  if (distanciaKm <= 18) return { envio: subtotal >= 25 ? 4.9 : 6.9, disponible: true };
  return { envio: 0, disponible: false };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const redsysSecret = Deno.env.get("REDSYS_SECRET_KEY");
    if (!redsysSecret) {
      return new Response(
        JSON.stringify({ error: "Redsys no está configurado." }),
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
    const query = `${supabaseUrl}/rest/v1/products?id=in.(${productIds.map(encodeURIComponent).join(",")})&select=id,nombre,precio,imagen,variantes`;
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

    const products: { id: string; nombre: string; precio: number; imagen: string; variantes: { formato: string; precio: number }[] | null }[] =
      await prodRes.json();

    if (products.length !== productIds.length) {
      return new Response(
        JSON.stringify({ error: "Uno o más productos no existen." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let subtotal = 0;
    for (const item of items) {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) continue;
      let precioValidado = Number(prod.precio);
      let nombreProducto = prod.nombre;
      if (item.variante_formato) {
        const variantes = Array.isArray(prod.variantes) ? prod.variantes : [];
        const v = variantes.find((vv) => vv.formato === item.variante_formato);
        if (!v) {
          return new Response(
            JSON.stringify({ error: `Variante no encontrada para ${prod.nombre}: ${item.variante_formato}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        precioValidado = Number(v.precio);
        nombreProducto = `${prod.nombre} (${item.variante_formato})`;
      }
      subtotal += precioValidado * item.cantidad;
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
      envio = subtotalTrasDescuento >= 25 ? 0 : 2.0;
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
      // envío incluido en el total del pedido Redsys
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
      metodo_pago: "redsys",
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
      let precioUnitario = Number(prod.precio);
      let productName = prod.nombre;
      if (item.variante_formato) {
        const variantes = Array.isArray(prod.variantes) ? prod.variantes : [];
        const v = variantes.find((vv) => vv.formato === item.variante_formato);
        if (v) {
          precioUnitario = Number(v.precio);
          productName = `${prod.nombre} (${item.variante_formato})`;
        }
      }
      return {
        order_id: orderId,
        product_id: item.id,
        product_name: productName,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
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

    // Generar número de pedido Redsys (12 dígitos, derivado del UUID)
    const redsysOrder = orderId.replace(/-/g, "").substring(0, 12).padStart(12, "0");
    const totalCentimos = Math.round((subtotalTrasDescuento + envio) * 100);

    const merchantParams: Record<string, string> = {
      Ds_Merchant_Amount: String(totalCentimos),
      Ds_Merchant_Order: redsysOrder,
      Ds_Merchant_MerchantCode: REDSYS_MERCHANT_CODE,
      Ds_Merchant_Currency: REDSYS_CURRENCY,
      Ds_Merchant_TransactionType: "0",
      Ds_Merchant_Terminal: REDSYS_TERMINAL,
      Ds_Merchant_MerchantURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/redsys-webhook`,
      Ds_Merchant_UrlOK: `${origin}/pago-exitoso?order_id=${orderId}`,
      Ds_Merchant_UrlKO: `${origin}/pago-cancelado?order_id=${orderId}`,
      Ds_Merchant_ConsumerLanguage: "1",
      Ds_Merchant_ProductDescription: `Pedido CabezaPerro #${orderId.slice(0, 8)}`,
      Ds_Merchant_Titular: `${cliente.nombre} ${cliente.apellidos}`,
      Ds_Merchant_MerchantName: "CabezaPerro",
    };

    const merchantParametersB64 = btoa(unescape(encodeURIComponent(JSON.stringify(merchantParams))));
    const signature = await signRedsysRequest(merchantParametersB64, redsysSecret);

    // Guardar el número de pedido Redsys en el pedido
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stripe_session_id: redsysOrder }),
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
      JSON.stringify({
        redsys_url: REDSYS_TEST_URL,
        redsys_merchant_parameters: merchantParametersB64,
        redsys_signature: signature,
        redsys_merchant_code: REDSYS_MERCHANT_CODE,
        redsys_terminal: REDSYS_TERMINAL,
        redsys_currency: REDSYS_CURRENCY,
        order_id: orderId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
