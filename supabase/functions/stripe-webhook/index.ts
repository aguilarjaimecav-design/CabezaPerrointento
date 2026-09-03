import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STORE_NAME = "CabezaPerro";
const STORE_EMAIL = "aguilarjaimecav@gmail.com";
const RESEND_FROM = "CabezaPerro <onboarding@resend.dev>";
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
  subtotal: number;
  envio: number;
  total: number;
}

interface OrderItemRow {
  product_name: string;
  cantidad: number;
  precio_unitario: number;
}

function money(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n));
}

function itemsListHtml(rows: OrderItemRow[]) {
  return rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0">${escapeHtml(r.product_name)}</td><td style="padding:6px 0;text-align:center">${r.cantidad}</td><td style="padding:6px 0;text-align:right">${money(r.precio_unitario)}</td><td style="padding:6px 0;text-align:right">${money(r.precio_unitario * r.cantidad)}</td></tr>`,
    )
    .join("");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  return emailShell(`
<div style="padding:28px 0;">
<h1 style="font-size:24px;color:#2f5d3a;margin:0 0 8px;">¡Gracias por tu compra!</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5b4f3d;">Hola ${escapeHtml(o.nombre)},<br/>hemos recibido tu pago correctamente. Aquí tienes el resumen de tu pedido.</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;color:#3a2f1d;">
<thead><tr style="border-bottom:1px solid #e7dcc8;"><th style="padding:6px 0;text-align:left;font-weight:bold;">Producto</th><th style="padding:6px 0;text-align:center;font-weight:bold;">Cant.</th><th style="padding:6px 0;text-align:right;font-weight:bold;">Precio</th><th style="padding:6px 0;text-align:right;font-weight:bold;">Subtotal</th></tr></thead>
<tbody>${itemsListHtml(items)}</tbody>
</table>
<table style="width:100%;font-size:14px;color:#3a2f1d;margin-top:12px;">
<tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${money(o.subtotal)}</td></tr>
<tr><td style="padding:4px 0;">Envío</td><td style="padding:4px 0;text-align:right;">${o.envio == 0 ? "Gratis" : money(o.envio)}</td></tr>
<tr style="border-top:1px solid #e7dcc8;"><td style="padding:8px 0;font-weight:bold;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${money(o.total)}</td></tr>
</table>
<h2 style="font-size:16px;color:#2f5d3a;margin:24px 0 8px;">Entrega</h2>
<p style="margin:0;font-size:14px;line-height:1.6;color:#5b4f3d;">
${escapeHtml(o.nombre)} ${escapeHtml(o.apellidos)}<br/>
${escapeHtml(o.calle)}, ${escapeHtml(o.numero)}${o.piso ? ", " + escapeHtml(o.piso) : ""}<br/>
${escapeHtml(o.codigo_postal)} Sevilla<br/>
Teléfono: ${escapeHtml(o.telefono)}
</p>
<p style="margin-top:20px;font-size:13px;color:#8a7d6a;line-height:1.6;">Si tienes cualquier duda sobre tu pedido, escríbenos por WhatsApp al ${escapeHtml(STORE_PHONE)} o responde a este correo.</p>
</div>`);
}

function sellerEmailHtml(o: OrderRow, items: OrderItemRow[], orderId: string) {
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
${escapeHtml(o.codigo_postal)} Sevilla
</p>
</div>`);
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to,
      subject,
      html,
      reply_to: STORE_EMAIL,
    }),
  });
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
      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({
          estado: "pagado",
          stripe_payment_intent: paymentIntent,
        }),
      });

      // Recuperar datos del pedido e items para el correo
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
        try {
          await Promise.all([
            sendEmail(order.email, `Confirmación de tu pedido en ${STORE_NAME}`, customerEmailHtml(order, itemRows)),
            sendEmail(STORE_EMAIL, `Nuevo pedido confirmado · ${STORE_NAME}`, sellerEmailHtml(order, itemRows, orderId)),
          ]);
        } catch { /* el envío de correo es best-effort: el pago ya está confirmado */ }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
