import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ORIGIN_ADDRESS = "Calle Lictores, 41018 Sevilla, España";
const ORS_API_KEY = Deno.env.get("ORS_API_KEY") ?? "";
const ORS_BASE = "https://api.openrouteservice.org";

interface ShippingRequest {
  calle: string;
  numero: string;
  codigo_postal: string;
  localidad: string;
  subtotal: number;
}

interface GeocodeResult {
  lat: number;
  lng: number;
}

async function geocode(address: string): Promise<GeocodeResult> {
  const url = `${ORS_BASE}/geocode/search?text=${encodeURIComponent(address)}&size=1`;
  const res = await fetch(url, {
    headers: { Authorization: ORS_API_KEY, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Geocodificación fallida (${res.status})`);
  }
  const data = await res.json();
  if (!data.features || data.features.length === 0) {
    throw new Error("No se encontró la dirección.");
  }
  const [lng, lat] = data.features[0].geometry.coordinates;
  return { lat, lng };
}

async function getDrivingDistance(origin: GeocodeResult, dest: GeocodeResult): Promise<number> {
  const url = `${ORS_BASE}/v2/directions/driving-car`;
  const body = {
    coordinates: [
      [origin.lng, origin.lat],
      [dest.lng, dest.lat],
    ],
    units: "km",
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: ORS_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Cálculo de ruta fallido (${res.status})`);
  }
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error("No se pudo calcular la ruta por carretera.");
  }
  return data.routes[0].summary.distance;
}

function calcularTarifa(distanciaKm: number, subtotal: number): {
  envio: number;
  disponible: boolean;
} {
  if (distanciaKm < 6) {
    return { envio: subtotal >= 25 ? 0 : 2.0, disponible: true };
  }
  if (distanciaKm <= 9) {
    return { envio: subtotal >= 25 ? 2.9 : 4.9, disponible: true };
  }
  if (distanciaKm <= 18) {
    return { envio: subtotal >= 25 ? 4.9 : 6.9, disponible: true };
  }
  return { envio: 0, disponible: false };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!ORS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "El servicio de cálculo de envío no está configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: ShippingRequest = await req.json();
    const { calle, numero, codigo_postal, localidad, subtotal } = body;

    if (!calle || !numero || !codigo_postal || !localidad) {
      return new Response(
        JSON.stringify({ error: "Faltan datos de dirección." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const destAddress = `${calle} ${numero}, ${codigo_postal} ${localidad}, Sevilla, España`;

    const originCoords = await geocode(ORIGIN_ADDRESS);
    const destCoords = await geocode(destAddress);
    const distanciaKm = await getDrivingDistance(originCoords, destCoords);

    const { envio, disponible } = calcularTarifa(distanciaKm, Number(subtotal));

    return new Response(
      JSON.stringify({
        distancia_km: Math.round(distanciaKm * 100) / 100,
        envio: Math.round(envio * 100) / 100,
        disponible,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al calcular el envío." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
