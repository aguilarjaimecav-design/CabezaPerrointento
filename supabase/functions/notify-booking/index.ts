import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STORE_EMAIL = "cabezaperro015@gmail.com";
const STORE_PHONE = "+34 644 789 324";

interface BookingData {
  booking_id?: string;
  nombre_dueno: string;
  telefono: string;
  email?: string;
  nombre_perro: string;
  raza: string;
  edad: string;
  nombre_perro_2?: string;
  raza_2?: string;
  edad_2?: string;
  fecha: string;
  hora: string;
  observaciones?: string;
  duracion?: string;
}

function fmtFecha(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildOwnerHtml(b: BookingData): string {
  const fechaFmt = fmtFecha(b.fecha);
  const perro2 = b.nombre_perro_2
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Segundo perro</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.nombre_perro_2} · ${b.raza_2 || "—"} · ${b.edad_2 || "—"}</td></tr>`
    : "";
  const obs = b.observaciones
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">Observaciones</td><td style="padding:8px 0;font-size:14px;">${b.observaciones}</td></tr>`
    : "";
  const duracion = b.duracion
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Duración</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.duracion}</td></tr>`
    : "";
  const emailRow = b.email
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.email}</td></tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4ede4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fffdf8;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <tr><td style="background:#3d6b4a;padding:28px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#f4ede4;">CabezaPerro</p>
          <p style="margin:4px 0 0;font-size:12px;color:#c9dcb0;letter-spacing:0.08em;text-transform:uppercase;">Nueva reserva de paseo</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:16px;color:#3d6b4a;">Has recibido una nueva reserva con los siguientes datos:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5dccd;">
            <tr><td style="padding:10px 0 8px;color:#6b7280;font-size:13px;">Fecha</td><td style="padding:10px 0 8px;font-size:14px;font-weight:600;text-transform:capitalize;">${fechaFmt} · ${b.hora}</td></tr>
            ${duracion}
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Cliente</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.nombre_dueno}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Teléfono</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.telefono}</td></tr>
            ${emailRow}
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Perro</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.nombre_perro} · ${b.raza || "—"} · ${b.edad || "—"}</td></tr>
            ${perro2}
            ${obs}
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">Contacta con el cliente para confirmar la reserva.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildCustomerHtml(b: BookingData): string {
  const fechaFmt = fmtFecha(b.fecha);
  const perro2 = b.nombre_perro_2
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Segundo perro</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.nombre_perro_2} · ${b.raza_2 || "—"} · ${b.edad_2 || "—"}</td></tr>`
    : "";
  const duracion = b.duracion
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Duración</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.duracion}</td></tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4ede4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fffdf8;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <tr><td style="background:#3d6b4a;padding:28px 32px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#f4ede4;">CabezaPerro</p>
          <p style="margin:4px 0 0;font-size:12px;color:#c9dcb0;letter-spacing:0.08em;text-transform:uppercase;">Confirmación de tu reserva</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 8px;font-size:18px;color:#3d6b4a;">¡Hola, ${b.nombre_dueno}!</p>
          <p style="margin:0 0 20px;font-size:16px;color:#3d6b4a;">Hemos recibido tu reserva de paseo. Estos son los datos que nos has indicado:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5dccd;">
            <tr><td style="padding:10px 0 8px;color:#6b7280;font-size:13px;">Fecha</td><td style="padding:10px 0 8px;font-size:14px;font-weight:600;text-transform:capitalize;">${fechaFmt} · ${b.hora}</td></tr>
            ${duracion}
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Perro</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${b.nombre_perro} · ${b.raza || "—"} · ${b.edad || "—"}</td></tr>
            ${perro2}
          </table>
          <p style="margin:24px 0 0;font-size:14px;color:#3d6b4a;">Nos pondremos en contacto contigo por teléfono para confirmar todos los detalles. Si tienes cualquier duda, escríbenos por WhatsApp al +34 644 789 324.</p>
          <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">¡Gracias por confiar en CabezaPerro!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function generateBookingPdf(b: BookingData, bookingId: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const green = rgb(0.24, 0.42, 0.29);
  const gold = rgb(0.78, 0.54, 0.18);
  const dark = rgb(0.23, 0.18, 0.11);
  const gray = rgb(0.54, 0.49, 0.42);
  const lightGray = rgb(0.91, 0.86, 0.78);
  const orange = rgb(0.85, 0.45, 0.15);

  let y = height - 50;

  // Header
  page.drawText("Cabeza", { x: 50, y, size: 24, font: bold, color: green });
  page.drawText("Perro", { x: 50 + bold.widthOfTextAtSize("Cabeza", 24), y, size: 24, font: bold, color: gold });
  y -= 20;
  page.drawText("Ticket de reserva", { x: 50, y, size: 11, font, color: gray });
  y -= 30;

  // Booking info
  const fechaCreacion = new Date().toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });
  page.drawText(`Reserva Nº: ${bookingId.substring(0, 8).toUpperCase()}`, { x: 50, y, size: 12, font: bold, color: dark });
  y -= 18;
  page.drawText(`Fecha de creación: ${fechaCreacion}`, { x: 50, y, size: 10, font, color: gray });
  y -= 22;

  // Status badge
  page.drawRectangle({ x: 50, y: y - 4, width: 160, height: 22, color: orange, borderRadius: 4 });
  page.drawText("PENDIENTE DE PAGO", { x: 58, y, size: 10, font: bold, color: rgb(1, 1, 1) });
  y -= 40;

  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: lightGray });
  y -= 25;

  // Owner data
  page.drawText("Datos del propietario", { x: 50, y, size: 12, font: bold, color: green });
  y -= 18;
  page.drawText(`Nombre: ${b.nombre_dueno}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(`Teléfono: ${b.telefono}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  if (b.email) {
    page.drawText(`Email: ${b.email}`, { x: 50, y, size: 10, font, color: dark });
    y -= 14;
  }
  y -= 15;

  // Dog data
  page.drawText("Datos del perro", { x: 50, y, size: 12, font: bold, color: green });
  y -= 18;
  page.drawText(`Nombre: ${b.nombre_perro}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(`Raza: ${b.raza || "—"}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(`Edad: ${b.edad || "—"}`, { x: 50, y, size: 10, font, color: dark });
  y -= 20;

  if (b.nombre_perro_2) {
    page.drawText("Segundo perro", { x: 50, y, size: 12, font: bold, color: green });
    y -= 18;
    page.drawText(`Nombre: ${b.nombre_perro_2}`, { x: 50, y, size: 10, font, color: dark });
    y -= 14;
    page.drawText(`Raza: ${b.raza_2 || "—"}`, { x: 50, y, size: 10, font, color: dark });
    y -= 14;
    page.drawText(`Edad: ${b.edad_2 || "—"}`, { x: 50, y, size: 10, font, color: dark });
    y -= 20;
  }

  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: lightGray });
  y -= 25;

  // Reservation details
  const fechaFmt = fmtFecha(b.fecha);
  page.drawText("Detalles de la reserva", { x: 50, y, size: 12, font: bold, color: green });
  y -= 18;
  page.drawText(`Fecha: ${fechaFmt}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(`Hora: ${b.hora}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  if (b.duracion) {
    page.drawText(`Duración: ${b.duracion}`, { x: 50, y, size: 10, font, color: dark });
    y -= 14;
  }

  if (b.observaciones) {
    y -= 10;
    page.drawText("Observaciones:", { x: 50, y, size: 10, font: bold, color: dark });
    y -= 14;
    const obsLines = b.observaciones.match(/.{1,70}/g) || [b.observaciones];
    for (const line of obsLines) {
      page.drawText(line, { x: 50, y, size: 10, font, color: dark });
      y -= 14;
    }
  }

  y -= 15;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: lightGray });
  y -= 25;

  // Price
  const precio = b.duracion === "60 min" ? "11 €" : "6 €";
  const precioExtra = b.nombre_perro_2 ? " + 5 € (segundo perro)" : "";
  page.drawText("Precio de la reserva", { x: 50, y, size: 12, font: bold, color: green });
  y -= 18;
  page.drawText(`${precio}${precioExtra}`, { x: 50, y, size: 14, font: bold, color: dark });
  y -= 20;
  page.drawText("Estado: PENDIENTE DE PAGO", { x: 50, y, size: 10, font: bold, color: orange });

  // Footer
  page.drawText(`CabezaPerro · Sevilla · ${STORE_EMAIL} · ${STORE_PHONE}`, { x: 50, y: 30, size: 9, font, color: gray });

  return new Uint8Array(await doc.save());
}

async function sendEmailWithAttachment(
  to: string,
  subject: string,
  html: string,
  resendApiKey: string,
  attachment?: { content: string; filename: string },
) {
  const body: Record<string, unknown> = {
    from: "CabezaPerro <notificaciones@cabezaperro.com>",
    to,
    subject,
    html,
  };
  if (attachment) {
    body.attachments = [attachment];
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const b = body as BookingData;

    if (!b?.nombre_dueno || !b?.telefono || !b?.fecha || !b?.hora) {
      return new Response(
        JSON.stringify({ error: "Faltan datos obligatorios de la reserva." }),
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminHeaders = {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    // Insert booking using service role key (bypasses RLS)
    const insertBody = {
      nombre_dueno: b.nombre_dueno,
      telefono: b.telefono,
      email: b.email || "",
      nombre_perro: b.nombre_perro,
      raza: b.raza || "",
      edad: b.edad || "",
      nombre_perro_2: b.nombre_perro_2 || "",
      raza_2: b.raza_2 || "",
      edad_2: b.edad_2 || "",
      fecha: b.fecha,
      hora: b.hora,
      duracion: b.duracion || null,
      observaciones: b.observaciones || "",
      autoriza_fotos: !!b.autoriza_fotos,
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(insertBody),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      return new Response(
        JSON.stringify({ error: `No se pudo guardar la reserva: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const insertedRows: { id: string }[] = await insertRes.json();
    const bookingId = insertedRows[0]?.id;

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "No se pudo obtener el ID de la reserva." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Generate PDF
    let pdfPath: string | null = null;
    let attachment: { content: string; filename: string } | undefined;

    try {
      const pdfBytes = await generateBookingPdf(b, bookingId);
      const base64 = btoa(String.fromCharCode(...pdfBytes));
      pdfPath = `bookings/${bookingId}.pdf`;
      attachment = { content: base64, filename: `reserva-${bookingId.substring(0, 8)}.pdf` };

      // Upload to storage
      const encodedPath = pdfPath.split("/").map(encodeURIComponent).join("/");
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/tickets/${encodedPath}`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/pdf",
          "x-upsert": "true",
        },
        body: pdfBytes,
      });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("Storage upload failed:", errText);
      }

      // Save path to DB
      await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ ticket_pdf_path: pdfPath }),
      });
    } catch { /* PDF generation is best-effort; emails still go out */ }

    // Send emails
    const emails: Promise<Response>[] = [
      sendEmailWithAttachment(
        STORE_EMAIL,
        `Nueva reserva de paseo — ${b.nombre_dueno} (${b.fecha} ${b.hora})`,
        buildOwnerHtml(b),
        resendApiKey,
        attachment,
      ),
    ];

    if (b.email && b.email.includes("@")) {
      emails.push(
        sendEmailWithAttachment(
          b.email,
          "Confirmación de tu reserva de paseo — CabezaPerro",
          buildCustomerHtml(b),
          resendApiKey,
          attachment,
        ),
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
      JSON.stringify({ success: true, booking_id: bookingId, ticket_pdf_path: pdfPath }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
