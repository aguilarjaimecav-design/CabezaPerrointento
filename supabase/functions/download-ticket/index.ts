import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const type = url.searchParams.get("type") || "order";

    if (!path) {
      return new Response(
        JSON.stringify({ error: "Falta el parámetro path." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate path format to prevent traversal
    if (path.includes("..") || !path.startsWith(`${type}s/`)) {
      return new Response(
        JSON.stringify({ error: "Ruta no válida." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/tickets/${encodedPath}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "No se pudo encontrar el ticket." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pdfBytes = await res.arrayBuffer();
    const filename = path.split("/").pop() || "ticket.pdf";

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al descargar el ticket." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
