import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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
const STORE_NIF = "NIF: 29542175D";

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

async function fetchLogoBase64(supabaseUrl: string, serviceKey: string): Promise<string> {
  const logoRes = await fetch(`${supabaseUrl}/storage/v1/object/public/tickets/logo-cabeza-perro.jpg`);
  if (logoRes.ok) {
    const buf = await logoRes.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  const projectUrl = supabaseUrl.replace(".supabase.co", ".supabase.co");
  const fallbackRes = await fetch(`${projectUrl}/storage/v1/object/public/public-images/logo-cabeza-perro.jpg`);
  if (fallbackRes.ok) {
    const buf = await fallbackRes.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  throw new Error("No se pudo obtener el logo desde Storage.");
}

async function generateOrderPdf(order: OrderRow, items: OrderItemRow[], orderId: string, logoBase64: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  let logo: Awaited<ReturnType<typeof doc.embedJpg>> | null = null;
  try {
    const logoBytes = Uint8Array.from(atob(logoBase64), (char) => char.charCodeAt(0));
    logo = await doc.embedJpg(logoBytes);
  } catch {
    // Logo optional — PDF still generates without it
  }

  const green = rgb(0.02, 0.35, 0.22);
  const paleGreen = rgb(0.91, 0.95, 0.92);
  const dark = rgb(0.13, 0.17, 0.15);
  const gray = rgb(0.40, 0.44, 0.42);
  const white = rgb(1, 1, 1);
  const line = rgb(0.12, 0.16, 0.14);
  const margin = 28;
  const right = width - margin;
  const date = new Date(order.created_at).toLocaleDateString("es-ES");
  const invoiceNo = orderId.substring(0, 8).toUpperCase();
  const total = Number(order.total);
  const taxableBase = total / 1.21;
  const iva = total - taxableBase;

  const drawRight = (text: string, y: number, size: number, font = regular, color = dark) => {
    page.drawText(text, { x: right - font.widthOfTextAtSize(text, size), y, size, font, color });
  };
  const drawCell = (text: string, x: number, y: number, cellWidth: number, size = 9, font = regular, color = dark) => {
    const max = cellWidth - 10;
    const value = font.widthOfTextAtSize(text, size) > max ? `${text.substring(0, Math.max(1, Math.floor(text.length * max / font.widthOfTextAtSize(text, size)) - 1))}…` : text;
    page.drawText(value, { x: x + 5, y, size, font, color });
  };

  // Header — logo + store info
  if (logo) {
    page.drawImage(logo, { x: margin, y: height - 118, width: 70, height: 70 });
  }
  page.drawText("CABEZAPERRO", { x: 115, y: height - 62, size: 23, font: bold, color: green });
  page.drawText("CUIDADO & TRADICIÓN CANINA", { x: 116, y: height - 82, size: 8, font: bold, color: green });
  page.drawText("Paseos · Alimentación · Bienestar", { x: 116, y: height - 99, size: 8, font: bold, color: green });
  page.drawText("CabezaPerro", { x: 430, y: height - 53, size: 9, font: bold, color: green });
  page.drawText(STORE_NIF, { x: 430, y: height - 68, size: 8, font: regular, color: dark });
  page.drawText("C.P. 41015 · Sevilla", { x: 430, y: height - 81, size: 8, font: regular, color: dark });
  page.drawText(STORE_PHONE, { x: 430, y: height - 94, size: 8, font: regular, color: dark });
  page.drawText(STORE_EMAIL, { x: 430, y: height - 107, size: 7.5, font: regular, color: dark });

  // Title section
  page.drawText("FACTURA", { x: margin, y: height - 157, size: 24, font: bold, color: green });
  page.drawText("SIMPLIFICADA", { x: margin, y: height - 182, size: 24, font: bold, color: green });
  page.drawRectangle({ x: 205, y: height - 181, width: 219, height: 76, color: paleGreen });
  page.drawText("Nº FACTURA:", { x: 213, y: height - 125, size: 8, font: bold, color: green });
  page.drawText(invoiceNo, { x: 290, y: height - 125, size: 9, font: bold, color: dark });
  page.drawText("FECHA:", { x: 213, y: height - 151, size: 8, font: bold, color: green });
  page.drawText(date, { x: 290, y: height - 151, size: 9, font: regular, color: dark });
  page.drawText("Factura simplificada · Documento de compra", { x: margin, y: height - 204, size: 7.5, font: regular, color: gray });

  // Table header
  const tableTop = height - 232;
  const columns = [margin, 136, 244, 353, right];
  const headerHeight = 52;
  page.drawRectangle({ x: margin, y: tableTop - headerHeight, width: right - margin, height: headerHeight, color: green });
  for (let i = 1; i < columns.length - 1; i++) page.drawLine({ start: { x: columns[i], y: tableTop }, end: { x: columns[i], y: tableTop - headerHeight }, thickness: 0.7, color: line });
  drawCell("CONCEPTO", columns[0], tableTop - 20, columns[1] - columns[0], 8, bold, white);
  drawCell("CANTIDAD", columns[1], tableTop - 20, columns[2] - columns[1], 8, bold, white);
  drawCell("PRECIO UNITARIO (IVA incluido)", columns[2], tableTop - 20, columns[3] - columns[2], 7, bold, white);
  drawCell("IMPORTE", columns[3], tableTop - 20, columns[4] - columns[3], 8, bold, white);

  // Table rows
  const rows = [...items.map((item) => ({ name: item.product_name, quantity: String(item.cantidad), unit: money(item.precio_unitario), amount: money(item.precio_unitario * item.cantidad) }))];
  if (Number(order.descuento) > 0) rows.push({ name: "Descuento", quantity: "1", unit: `-${money(Number(order.descuento))}`, amount: `-${money(Number(order.descuento))}` });
  if (Number(order.envio) > 0) rows.push({ name: "Entrega a domicilio", quantity: "1", unit: money(order.envio), amount: money(order.envio) });
  const rowHeight = 22;
  const bodyHeight = Math.max(66, rows.length * rowHeight + 22);
  const bodyTop = tableTop - headerHeight;
  page.drawRectangle({ x: margin, y: bodyTop - bodyHeight, width: right - margin, height: bodyHeight, borderColor: line, borderWidth: 0.7, color: white });
  for (let i = 1; i < columns.length - 1; i++) page.drawLine({ start: { x: columns[i], y: bodyTop }, end: { x: columns[i], y: bodyTop - bodyHeight }, thickness: 0.7, color: line });
  rows.forEach((row, index) => {
    const y = bodyTop - 16 - index * rowHeight;
    drawCell(row.name, columns[0], y, columns[1] - columns[0], 8, regular, dark);
    drawCell(row.quantity, columns[1], y, columns[2] - columns[1], 8, regular, dark);
    drawCell(row.unit, columns[2], y, columns[3] - columns[2], 8, regular, dark);
    drawCell(row.amount, columns[3], y, columns[4] - columns[3], 8, regular, dark);
  });

  // Totals
  const totalsTop = bodyTop - bodyHeight - 25;
  const labelWidth = 237;
  const totalsRows = [["BASE IMPONIBLE", money(taxableBase)], ["IVA (21%)", money(iva)], ["TOTAL FACTURA", money(total)]];
  totalsRows.forEach(([label, value], index) => {
    const y = totalsTop - index * 25;
    page.drawRectangle({ x: margin, y: y - 18, width: labelWidth, height: 25, color: index === 2 ? green : paleGreen, borderColor: line, borderWidth: 0.6 });
    page.drawRectangle({ x: margin + labelWidth, y: y - 18, width: right - margin - labelWidth, height: 25, color: white, borderColor: line, borderWidth: 0.6 });
    page.drawText(label, { x: margin + 5, y: y - 9, size: 8.5, font: index === 2 ? regular : bold, color: index === 2 ? white : dark });
    drawRight(value, y - 9, index === 2 ? 11 : 8.5, index === 2 ? bold : regular, dark);
  });

  // Payment info
  const infoY = totalsTop - 105;
  page.drawText("Forma de pago:", { x: margin, y: infoY, size: 9, font: bold, color: dark });
  page.drawText(order.metodo_pago || "Pago seguro con Stripe", { x: margin, y: infoY - 16, size: 9, font: regular, color: gray });
  page.drawText("Observaciones:", { x: margin, y: infoY - 48, size: 9, font: bold, color: dark });
  page.drawText("Pedido pagado · Entrega a domicilio en Sevilla y alrededores", { x: margin, y: infoY - 64, size: 8.5, font: regular, color: gray });

  // Footer — "Gracias por tu confianza"
  page.drawText("¡Gracias", { x: 235, y: 105, size: 22, font: serif, color: green });
  page.drawText("por tu confianza!", { x: 198, y: 79, size: 22, font: serif, color: green });
  page.drawLine({ start: { x: 158, y: 64 }, end: { x: 437, y: 64 }, thickness: 0.8, color: green });
  page.drawText("Cuidado · Bienestar · Cercanía", { x: 220, y: 44, size: 8, font: bold, color: green });
  page.drawText(`${STORE_NAME} · ${STORE_EMAIL} · ${STORE_PHONE}`, { x: 145, y: 28, size: 7, font: regular, color: gray });

  return new Uint8Array(await doc.save());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY no configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminHeaders = {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    };

    const orderId = "9f37254a-002e-4c06-821f-58f7f6f6c26b";

    // Fetch order
    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`, { headers: adminHeaders });
    const orderRows: OrderRow[] = orderRes.ok ? await orderRes.json() : [];
    if (orderRows.length === 0) {
      return new Response(JSON.stringify({ error: "Pedido no encontrado." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const order = orderRows[0];

    // Fetch items
    const itemsRes = await fetch(`${supabaseUrl}/rest/v1/order_items?order_id=eq.${orderId}&select=product_name,cantidad,precio_unitario`, { headers: adminHeaders });
    const itemRows: OrderItemRow[] = itemsRes.ok ? await itemsRes.json() : [];

    // Fetch logo from Storage
    let logoBase64 = "";
    try {
      const logoStorageRes = await fetch(`${supabaseUrl}/storage/v1/object/tickets/logo-cabeza-perro.jpg`, {
        headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}` },
      });
      if (logoStorageRes.ok) {
        const buf = await logoStorageRes.arrayBuffer();
        logoBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      }
    } catch { /* logo optional */ }

    // Generate PDF
    const pdfBytes = await generateOrderPdf(order, itemRows, orderId, logoBase64);
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

    // Upload to storage (overwrite)
    const pdfPath = `orders/${orderId}.pdf`;
    const encodedPath = pdfPath.split("/").map(encodeURIComponent).join("/");
    await fetch(`${supabaseUrl}/storage/v1/object/tickets/${encodedPath}`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true",
      },
      body: pdfBytes,
    });

    // Send email with attachment
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: STORE_EMAIL,
        subject: "Prueba — Ticket de compra (diseño actualizado)",
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4ede4;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:32px 16px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#fffdf8;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);"><tr><td style="background:#3d6b4a;padding:28px 32px;"><p style="margin:0;font-size:20px;font-weight:700;color:#f4ede4;">CabezaPerro</p><p style="margin:4px 0 0;font-size:12px;color:#c9dcb0;letter-spacing:0.08em;text-transform:uppercase;">Ticket regenerado con diseño actualizado</p></td></tr><tr><td style="padding:28px 32px;"><p style="font-size:16px;color:#3d6b4a;">Adjuntamos el ticket regenerado con todos los elementos solicitados: logotipo, paleta de colores, tipografía y NIF 29542175D.</p><p style="font-size:13px;color:#9ca3af;margin-top:24px;">Pedido #${orderId.slice(0, 8)}</p></td></tr></table></td></tr></table></body></html>`,
        reply_to: STORE_EMAIL,
        attachments: [{ filename: `ticket-${orderId.slice(0, 8)}.pdf`, content: pdfBase64 }],
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      return new Response(JSON.stringify({ error: `Resend API error: ${errText}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, message: `Ticket regenerado y enviado a ${STORE_EMAIL}` }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Error al regenerar el ticket." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
