import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.25.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STORE_NAME = "CabezaPerro";
const STORE_EMAIL = "cabezaperro015@gmail.com";
const RESEND_FROM = "CabezaPerro <notificaciones@cabezaperro.com>";
const STORE_PHONE = "+34 644 789 324";

interface OrderRow {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  calle: string;
  numero: string;
  piso: string;
  codigo_postal: string;
  localidad: string;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  metodo_pago: string;
  created_at: string;
}

interface OrderItemRow {
  product_name: string;
  cantidad: number;
  precio_unitario: number;
}

function money(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n));
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemsListHtml(rows: OrderItemRow[]) {
  return rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0">${escapeHtml(r.product_name)}</td><td style="padding:6px 0;text-align:center">${r.cantidad}</td><td style="padding:6px 0;text-align:right">${money(r.precio_unitario)}</td><td style="padding:6px 0;text-align:right">${money(r.precio_unitario * r.cantidad)}</td></tr>`,
    )
    .join("");
}

function emailShell(inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;font-family:Georgia,'Times New Roman',serif;background:#faf6ef;color:#3a2f1d;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
<div style="text-align:center;padding-bottom:20px;border-bottom:1px solid #e7dcc8;">
<span style="font-size:22px;font-weight:bold;color:#2f5d3a;">Cabeza<span style="color:#c68a2e;">Perro</span></span>
</div>
${inner}
<div style="margin-top:32px;padding-top:20px;border-top:1px solid #e7dcc8;font-size:12px;color:#8a7d6a;text-align:center;line-height:1.6;">
${STORE_NAME} · Sevilla<br/>
${escapeHtml(STORE_EMAIL)} · ${escapeHtml(STORE_PHONE)}
</div>
</div></body></html>`;
}

function customerEmailHtml(o: OrderRow, items: OrderItemRow[]) {
  const descRow = Number(o.descuento) > 0
    ? `<tr><td style="padding:4px 0;">Descuento</td><td style="padding:4px 0;text-align:right;">-${money(Number(o.descuento))}</td></tr>`
    : "";
  return emailShell(`
<div style="padding:28px 0;">
<h1 style="font-size:24px;color:#2f5d3a;margin:0 0 8px;">¡Gracias por tu compra!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5b4f3d;">Hola ${escapeHtml(o.nombre)},<br/>hemos recibido tu pago correctamente. Aquí tienes el resumen de tu pedido. Adjuntamos el ticket en PDF.</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;color:#3a2f1d;">
<thead><tr style="border-bottom:1px solid #e7dcc8;"><th style="padding:6px 0;text-align:left;font-weight:bold;">Producto</th><th style="padding:6px 0;text-align:center;font-weight:bold;">Cant.</th><th style="padding:6px 0;text-align:right;font-weight:bold;">Precio</th><th style="padding:6px 0;text-align:right;font-weight:bold;">Subtotal</th></tr></thead>
<tbody>${itemsListHtml(items)}</tbody>
</table>
<table style="width:100%;font-size:14px;color:#3a2f1d;margin-top:12px;">
<tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${money(o.subtotal)}</td></tr>
${descRow}
<tr><td style="padding:4px 0;">Envío</td><td style="padding:4px 0;text-align:right;">${o.envio == 0 ? "Gratis" : money(o.envio)}</td></tr>
<tr style="border-top:1px solid #e7dcc8;"><td style="padding:8px 0;font-weight:bold;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${money(o.total)}</td></tr>
</table>
<h2 style="font-size:16px;color:#2f5d3a;margin:24px 0 8px;">Entrega</h2>
<p style="margin:0;font-size:14px;line-height:1.6;color:#5b4f3d;">
${escapeHtml(o.nombre)} ${escapeHtml(o.apellidos)}<br/>
${escapeHtml(o.calle)}, ${escapeHtml(o.numero)}${o.piso ? ", " + escapeHtml(o.piso) : ""}<br/>
${escapeHtml(o.codigo_postal)} ${escapeHtml(o.localidad || "Sevilla")}<br/>
Teléfono: ${escapeHtml(o.telefono)}
</p>
<p style="margin-top:20px;font-size:13px;color:#8a7d6a;line-height:1.6;">Si tienes cualquier duda sobre tu pedido, escríbenos por WhatsApp al ${escapeHtml(STORE_PHONE)} o responde a este correo.</p>
</div>`);
}

function sellerEmailHtml(o: OrderRow, items: OrderItemRow[], orderId: string) {
  const descRow = Number(o.descuento) > 0
    ? `<tr><td style="padding:4px 0;">Descuento</td><td style="padding:4px 0;text-align:right;">-${money(Number(o.descuento))}</td></tr>`
    : "";
  return emailShell(`
<div style="padding:28px 0;">
<h1 style="font-size:22px;color:#2f5d3a;margin:0 0 8px;">Nuevo pedido recibido</h1>
<p style="margin:0 0 16px;font-size:14px;color:#5b4f3d;">Pedido <strong>${orderId.substring(0, 8)}</strong> · Pago confirmado</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;color:#3a2f1d;">
<thead><tr style="border-bottom:1px solid #e7dcc8;"><th style="padding:6px 0;text-align:left;font-weight:bold;">Producto</th><th style="padding:6px 0;text-align:center;font-weight:bold;">Cant.</th><th style="padding:6px 0;text-align:right;font-weight:bold;">Precio</th><th style="padding:6px 0;text-align:right;font-weight:bold;">Subtotal</th></tr></thead>
<tbody>${itemsListHtml(items)}</tbody>
</table>
<table style="width:100%;font-size:14px;color:#3a2f1d;margin-top:12px;">
<tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${money(o.subtotal)}</td></tr>
${descRow}
<tr><td style="padding:4px 0;">Envío</td><td style="padding:4px 0;text-align:right;">${o.envio == 0 ? "Gratis" : money(o.envio)}</td></tr>
<tr style="border-top:1px solid #e7dcc8;"><td style="padding:8px 0;font-weight:bold;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${money(o.total)}</td></tr>
</table>
<h2 style="font-size:16px;color:#2f5d3a;margin:24px 0 8px;">Cliente</h2>
<p style="margin:0;font-size:14px;line-height:1.6;color:#5b4f3d;">
${escapeHtml(o.nombre)} ${escapeHtml(o.apellidos)}<br/>
<a href="mailto:${escapeHtml(o.email)}" style="color:#2f5d3a;">${escapeHtml(o.email)}</a> · ${escapeHtml(o.telefono)}
</p>
<h2 style="font-size:16px;color:#2f5d3a;margin:16px 0 8px;">Dirección de entrega</h2>
<p style="margin:0;font-size:14px;line-height:1.6;color:#5b4f3d;">
${escapeHtml(o.calle)}, ${escapeHtml(o.numero)}${o.piso ? ", " + escapeHtml(o.piso) : ""}<br/>
${escapeHtml(o.codigo_postal)} ${escapeHtml(o.localidad || "Sevilla")}
</p>
</div>`);
}

async function sendEmailWithAttachment(to: string, subject: string, html: string, attachment?: { content: string; filename: string }) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return;
  const body: Record<string, unknown> = {
    from: RESEND_FROM,
    to,
    subject,
    html,
    reply_to: STORE_EMAIL,
  };
  if (attachment) {
    body.attachments = [attachment];
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function generateOrderPdf(order: OrderRow, items: OrderItemRow[], orderId: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const green = rgb(0.18, 0.42, 0.29);
  const gold = rgb(0.78, 0.54, 0.18);
  const dark = rgb(0.23, 0.18, 0.11);
  const gray = rgb(0.54, 0.49, 0.42);
  const lightGray = rgb(0.91, 0.86, 0.78);

  let y = height - 50;
  // Header
  page.drawText("Cabeza", { x: 50, y, size: 24, font: bold, color: green });
  page.drawText("Perro", { x: 50 + bold.widthOfTextAtSize("Cabeza", 24), y, size: 24, font: bold, color: gold });
  y -= 20;
  page.drawText("Ticket de compra", { x: 50, y, size: 11, font, color: gray });
  y -= 30;

  // Order info
  const fecha = new Date(order.created_at).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });
  page.drawText(`Pedido Nº: ${orderId.substring(0, 8).toUpperCase()}`, { x: 50, y, size: 12, font: bold, color: dark });
  page.drawText(`Fecha: ${fecha}`, { x: 50, y: y - 18, size: 10, font, color: gray });
  page.drawText(`Estado: PAGADO`, { x: 50, y: y - 36, size: 10, font: bold, color: green });
  page.drawText(`Método de pago: ${order.metodo_pago || "Stripe"}`, { x: 50, y: y - 54, size: 10, font, color: gray });
  y -= 80;

  // Line
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: lightGray });
  y -= 25;

  // Customer
  page.drawText("Datos del cliente", { x: 50, y, size: 12, font: bold, color: green });
  y -= 18;
  page.drawText(`${order.nombre} ${order.apellidos}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(`Tel: ${order.telefono}`, { x: 50, y, size: 10, font, color: dark });
  y -= 20;

  // Delivery
  page.drawText("Dirección de entrega", { x: 50, y, size: 12, font: bold, color: green });
  y -= 18;
  page.drawText(`${order.calle}, ${order.numero}${order.piso ? ", " + order.piso : ""}`, { x: 50, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(`${order.codigo_postal} ${order.localidad || "Sevilla"}`, { x: 50, y, size: 10, font, color: dark });
  y -= 25;

  // Line
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: lightGray });
  y -= 25;

  // Items header
  page.drawText("Producto", { x: 50, y, size: 10, font: bold, color: dark });
  page.drawText("Cant.", { x: 340, y, size: 10, font: bold, color: dark });
  page.drawText("Precio", { x: 410, y, size: 10, font: bold, color: dark });
  page.drawText("Subtotal", { x: 500, y, size: 10, font: bold, color: dark });
  y -= 15;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: lightGray });
  y -= 15;

  for (const item of items) {
    if (y < 150) {
      const newPage = doc.addPage([595, 842]);
      y = newPage.getSize().height - 50;
    }
    const name = item.product_name.length > 40 ? item.product_name.substring(0, 40) + "…" : item.product_name;
    page.drawText(name, { x: 50, y, size: 10, font, color: dark });
    page.drawText(String(item.cantidad), { x: 350, y, size: 10, font, color: dark });
    page.drawText(money(item.precio_unitario), { x: 400, y, size: 10, font, color: dark });
    page.drawText(money(item.precio_unitario * item.cantidad), { x: 480, y, size: 10, font, color: dark });
    y -= 16;
  }

  y -= 10;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: lightGray });
  y -= 20;

  // Totals
  page.drawText("Subtotal", { x: 380, y, size: 10, font, color: dark });
  page.drawText(money(order.subtotal), { x: 500, y, size: 10, font, color: dark });
  y -= 16;

  if (Number(order.descuento) > 0) {
    page.drawText("Descuento", { x: 380, y, size: 10, font, color: dark });
    page.drawText(`-${money(Number(order.descuento))}`, { x: 500, y, size: 10, font, color: dark });
    y -= 16;
  }

  page.drawText("Envío", { x: 380, y, size: 10, font, color: dark });
  page.drawText(order.envio == 0 ? "Gratis" : money(order.envio), { x: 500, y, size: 10, font, color: dark });
  y -= 20;

  page.drawLine({ start: { x: 380, y }, end: { x: width - 50, y }, thickness: 1, color: lightGray });
  y -= 18;

  page.drawText("Total", { x: 380, y, size: 14, font: bold, color: green });
  page.drawText(money(order.total), { x: 500, y, size: 14, font: bold, color: green });
  y -= 40;

  // Footer
  page.drawText(`${STORE_NAME} · Sevilla · ${STORE_EMAIL} · ${STORE_PHONE}`, { x: 50, y: 30, size: 9, font, color: gray });

  return new Uint8Array(await doc.save());
}

async function uploadToStorage(supabaseUrl: string, serviceKey: string, path: string, pdfBytes: Uint8Array): Promise<boolean> {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`${supabaseUrl}/storage/v1/object/tickets/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: pdfBytes,
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Storage upload failed:", errText);
  }
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeSecret || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Faltan STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Falta la firma de Stripe.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
  } catch (err) {
    return new Response(`Error de firma: ${err.message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const adminHeaders = {
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    "Content-Type": "application/json",
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const paymentIntent = session.payment_intent as string;

    if (orderId) {
      // Check if already processed (idempotency)
      const existingRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=estado,ticket_pdf_path`,
        { headers: adminHeaders },
      );
      const existingRows: { estado: string; ticket_pdf_path: string | null }[] = existingRes.ok ? await existingRes.json() : [];

      if (existingRows.length > 0 && existingRows[0].estado === "pagado" && existingRows[0].ticket_pdf_path) {
        return new Response(JSON.stringify({ received: true, deduplicated: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({
          estado: "pagado",
          stripe_payment_intent: paymentIntent,
        }),
      });

      // Fetch order data
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`,
        { headers: adminHeaders },
      );
      const orderRows: OrderRow[] = orderRes.ok ? await orderRes.json() : [];

      const itemsRes = await fetch(
        `${supabaseUrl}/rest/v1/order_items?order_id=eq.${orderId}&select=product_name,cantidad,precio_unitario`,
        { headers: adminHeaders },
      );
      const itemRows: OrderItemRow[] = itemsRes.ok ? await itemsRes.json() : [];

      if (orderRows.length > 0) {
        const order = orderRows[0];

        // Generate PDF
        let pdfPath: string | null = null;
        try {
          const pdfBytes = await generateOrderPdf(order, itemRows, orderId);
          const base64 = btoa(String.fromCharCode(...pdfBytes));
          pdfPath = `orders/${orderId}.pdf`;
          await uploadToStorage(supabaseUrl, supabaseServiceKey, pdfPath, pdfBytes);

          // Save path to DB
          await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
            method: "PATCH",
            headers: adminHeaders,
            body: JSON.stringify({ ticket_pdf_path: pdfPath }),
          });

          // Send emails with PDF attachment
          const attachment = { content: base64, filename: `ticket-${orderId.substring(0, 8)}.pdf` };
          await Promise.all([
            sendEmailWithAttachment(order.email, `Confirmación de tu pedido en ${STORE_NAME}`, customerEmailHtml(order, itemRows), attachment),
            sendEmailWithAttachment(STORE_EMAIL, `Nuevo pedido confirmado · ${STORE_NAME}`, sellerEmailHtml(order, itemRows, orderId), attachment),
          ]);
        } catch {
          // If PDF fails, send emails without attachment
          try {
            await Promise.all([
              sendEmailWithAttachment(order.email, `Confirmación de tu pedido en ${STORE_NAME}`, customerEmailHtml(order, itemRows)),
              sendEmailWithAttachment(STORE_EMAIL, `Nuevo pedido confirmado · ${STORE_NAME}`, sellerEmailHtml(order, itemRows, orderId)),
            ]);
          } catch { /* best-effort */ }
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
