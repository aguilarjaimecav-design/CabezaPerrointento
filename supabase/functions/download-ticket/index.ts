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
        JSON.stringify({ error: `Ruta no válida: ${path}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Encode each path segment individually (keep slashes)
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");

    // Use the Supabase Storage REST API to download the object
    const downloadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/tickets/${encodedPath}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    );

    if (!downloadRes.ok) {
      const errText = await downloadRes.text();
      return new Response(
        JSON.stringify({ error: `Storage devolvió ${downloadRes.status}: ${errText}` }),
        { status: downloadRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pdfBytes = await downloadRes.arrayBuffer();
    if (pdfBytes.byteLength === 0) {
      return new Response(
        JSON.stringify({ error: "El archivo está vacío." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const filename = path.split("/").pop() || "ticket.pdf";

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.byteLength),
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al descargar el ticket." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
