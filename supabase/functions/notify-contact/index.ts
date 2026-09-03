import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactData {
  nombre: string;
  email: string;
  telefono?: string;
  motivo: string;
  mensaje: string;
}

function buildOwnerHtml(c: ContactData): string {
  const telRow = c.telefono
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Teléfono</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${c.telefono}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4ede4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fffdf8;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <tr><td style="background:#3d6b4a;padding:28px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#f4ede4;">CabezaPerro</p>
          <p style="margin:4px 0 0;font-size:12px;color:#c9dcb0;letter-spacing:0.08em;text-transform:uppercase;">Nuevo mensaje de contacto</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:16px;color:#3d6b4a;">Has recibido un nuevo mensaje con los siguientes datos:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5dccd;">
            <tr><td style="padding:10px 0 8px;color:#6b7280;font-size:13px;">Nombre</td><td style="padding:10px 0 8px;font-size:14px;font-weight:600;">${c.nombre}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${c.email}</td></tr>
            ${telRow}
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Motivo</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${c.motivo}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:8px 0;font-size:14px;">${c.mensaje}</td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">Responde al cliente desde tu correo o por WhatsApp.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildCustomerHtml(c: ContactData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4ede4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fffdf8;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <tr><td style="background:#3d6b4a;padding:28px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#f4ede4;">CabezaPerro</p>
          <p style="margin:4px 0 0;font-size:12px;color:#c9dcb0;letter-spacing:0.08em;text-transform:uppercase;">Hemos recibido tu mensaje</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 8px;font-size:18px;color:#3d6b4a;">¡Hola, ${c.nombre}!</p>
          <p style="margin:0 0 20px;font-size:16px;color:#3d6b4a;">Gracias por escribirnos. Hemos recibido tu mensaje sobre <strong>${c.motivo}</strong> y te responderemos lo antes posible.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5dccd;">
            <tr><td style="padding:10px 0 8px;color:#6b7280;font-size:13px;vertical-align:top;">Tu mensaje</td><td style="padding:10px 0 8px;font-size:14px;">${c.mensaje}</td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;color:#3d6b4a;">Si tienes algo urgente, escríbenos por WhatsApp al +34 644 789 324.</p>
          <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">¡Gracias por confiar en CabezaPerro!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const c = body as ContactData;

    if (!c?.nombre || !c?.email || !c?.motivo || !c?.mensaje) {
      return new Response(
        JSON.stringify({ error: "Faltan datos obligatorios del mensaje." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY no configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const emails: Promise<Response>[] = [
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CabezaPerro <onboarding@resend.dev>",
          to: "aguilarjaimecav@gmail.com",
          subject: `Nuevo mensaje de contacto — ${c.nombre} (${c.motivo})`,
          html: buildOwnerHtml(c),
        }),
      }),
    ];

    if (c.email.includes("@")) {
      emails.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CabezaPerro <onboarding@resend.dev>",
            to: c.email,
            subject: "Hemos recibido tu mensaje — CabezaPerro",
            html: buildCustomerHtml(c),
          }),
        }),
      );
    }

    const responses = await Promise.all(emails);
    for (const res of responses) {
      if (!res.ok) {
        const errText = await res.text();
        return new Response(
          JSON.stringify({ error: `Resend API error: ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
