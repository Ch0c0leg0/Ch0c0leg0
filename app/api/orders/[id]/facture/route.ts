import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/session";
import { mapOrder } from "@/lib/supabase/mappers";
import type { OrderItemRow, OrderRow } from "@/lib/supabase/types";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

/* =====================================================================
 * Coordonnées du vendeur — À REMPLIR (utilisées dans l'en-tête + le pied
 * de page de chaque facture).
 * ===================================================================== */
const SELLER = {
  name: "Ch0c0leg0",
  legal: "Raison sociale à compléter",
  address: "Adresse à compléter",
  city: "75000 Paris",
  siret: "SIREN à compléter",
  email: "bonjour@votre-domaine.fr",
};

/* =====================================================================
 * Mini-moteur PDF (zéro dépendance) : A4, Helvetica / Helvetica-Bold,
 * encodage WinAnsi (accents corrects), aplats, filets, multipage.
 * ===================================================================== */

type RGB = [number, number, number];
const INK: RGB = [0.13, 0.09, 0.06];
const MUTED: RGB = [0.42, 0.32, 0.22];
const LINE: RGB = [0.88, 0.83, 0.74];
const BAND_BG: RGB = [0.13, 0.09, 0.06];
const BAND_FG: RGB = [0.98, 0.95, 0.89];
const ZEBRA: RGB = [0.97, 0.94, 0.88];
const WHITE: RGB = [1, 1, 1];

const WINANSI_EXTRA: Record<number, number> = {
  0x20ac: 0x80, // €
  0x2019: 0x92, // ’
  0x2018: 0x91, // ‘
  0x201c: 0x93, // “
  0x201d: 0x94, // ”
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x2212: 0x96, // − (signe moins)
  0x2026: 0x85, // …
  0x0153: 0x9c, // œ
  0x0152: 0x8c, // Œ
  0x00ab: 0xab, // «
  0x00bb: 0xbb, // »
};
const WINANSI_GAPS = new Set([0x81, 0x8d, 0x8f, 0x90, 0x9d]);

/** Texte -> octets WinAnsi (+ échappement parenthèses). */
function winBytes(s: string): number[] {
  const clean = s.replace(/[   ]/g, " ");
  const out: number[] = [];
  for (const ch of clean) {
    const c = ch.codePointAt(0) ?? 0x3f;
    if (c === 0x28) out.push(0x5c, 0x28);
    else if (c === 0x29) out.push(0x5c, 0x29);
    else if (c === 0x5c) out.push(0x5c, 0x5c);
    else if (c < 0x80) out.push(c);
    else if (c <= 0xff && !WINANSI_GAPS.has(c)) out.push(c);
    else if (WINANSI_EXTRA[c] !== undefined) out.push(WINANSI_EXTRA[c]);
    else out.push(0x3f);
  }
  return out;
}

function ascii(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0x7f);
  return out;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function col([r, g, b]: RGB): string {
  return `${fmt(r)} ${fmt(g)} ${fmt(b)}`;
}

/** Largeur approximative (Helvetica ~0.5em en moyenne). */
function estWidth(s: string, size: number, bold = false): number {
  return s.length * size * (bold ? 0.52 : 0.48);
}

class Page {
  ops: number[] = [];
  text(
    x: number,
    y: number,
    s: string,
    opts?: { font?: 1 | 2; size?: number; color?: RGB; align?: "left" | "right"; maxWidth?: number }
  ) {
    const font = opts?.font ?? 1;
    const size = opts?.size ?? 10;
    const color = opts?.color ?? INK;
    let str = s;
    if (opts?.maxWidth) {
      const maxChars = Math.max(4, Math.floor(opts.maxWidth / (size * 0.5)));
      if (str.length > maxChars) str = str.slice(0, maxChars - 1) + "…";
    }
    let tx = x;
    if (opts?.align === "right") tx = x - estWidth(str, size, font === 2);
    this.ops.push(
      ...ascii(`BT /F${font} ${size} Tf ${col(color)} rg ${fmt(tx)} ${fmt(y)} Td (`),
      ...winBytes(str),
      ...ascii(") Tj ET\n")
    );
  }
  rect(x: number, y: number, w: number, h: number, color: RGB) {
    this.ops.push(...ascii(`${col(color)} rg ${fmt(x)} ${fmt(y)} ${fmt(w)} ${fmt(h)} re f\n`));
  }
  rule(x1: number, y: number, x2: number, color: RGB = LINE, width = 0.75) {
    this.ops.push(
      ...ascii(`${col(color)} RG ${fmt(width)} w ${fmt(x1)} ${fmt(y)} m ${fmt(x2)} ${fmt(y)} l S\n`)
    );
  }
}

function assemble(pages: Page[]): Uint8Array {
  const buf: number[] = [];
  const push = (...xs: number[]) => {
    for (const x of xs) buf.push(x);
  };
  const offsets: number[] = [];
  push(...ascii("%PDF-1.4\n"));
  const objs: number[][] = [];
  // 1 = catalogue, 2 = pages ; puis 1 objet contenu + 1 objet page par page ; F1, F2.
  const nPages = pages.length;
  objs.push(ascii(`1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`));
  const kids = pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ");
  objs.push(ascii(`2 0 obj << /Type /Pages /Kids [${kids}] /Count ${nPages} >> endobj\n`));
  pages.forEach((p, i) => {
    const contentObj = 3 + i * 2;
    const pageObj = 4 + i * 2;
    const head = ascii(`<< /Length ${p.ops.length} >>\nstream\n`);
    const tail = ascii("\nendstream");
    objs.push([...ascii(`${contentObj} 0 obj `), ...head, ...p.ops, ...tail, ...ascii(" endobj\n")]);
    objs.push(
      ascii(
        `${pageObj} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObj} 0 R /Resources << /Font << /F1 ${3 + nPages * 2} 0 R /F2 ${4 + nPages * 2} 0 R >> >> >> endobj\n`
      )
    );
  });
  objs.push(ascii(`${3 + nPages * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n`));
  objs.push(
    ascii(`${4 + nPages * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n`)
  );
  for (const o of objs) {
    offsets.push(buf.length);
    push(...o);
  }
  const xref = buf.length;
  push(...ascii(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`));
  for (const off of offsets) push(...ascii(`${String(off).padStart(10, "0")} 00000 n \n`));
  push(...ascii(`trailer << /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return new Uint8Array(buf);
}

/* =====================================================================
 * Contenu facture
 * ===================================================================== */

const LEFT = 50;
const RIGHT = 545;
const TOP_BAND_H = 78;

function drawHeader(p: Page, invoiceNo: string, emissionDate: string) {
  p.rect(0, 842 - TOP_BAND_H, 595, TOP_BAND_H, BAND_BG);
  p.text(LEFT, 842 - 34, `${SELLER.name} .`, { font: 2, size: 20, color: BAND_FG });
  p.text(LEFT, 842 - 52, "Matériel gaming — vente en ligne", { size: 9, color: BAND_FG });
  p.text(RIGHT, 842 - 32, "FACTURE", { font: 2, size: 24, color: BAND_FG, align: "right" });
  p.text(RIGHT, 842 - 50, `N° ${invoiceNo}`, { size: 11, color: BAND_FG, align: "right" });
  p.text(RIGHT, 842 - 64, `Émise le ${emissionDate}`, { size: 9, color: BAND_FG, align: "right" });
}

function drawParties(
  p: Page,
  topY: number,
  sellerLines: string[],
  clientLines: string[],
  orderMeta: string[]
): number {
  let y = topY;
  p.text(LEFT, y, "ÉMETTEUR", { font: 2, size: 9, color: MUTED });
  p.text(320, y, "FACTURÉ À", { font: 2, size: 9, color: MUTED });
  y -= 15;
  p.text(LEFT, y, sellerLines[0] ?? "", { font: 2, size: 11 });
  p.text(320, y, clientLines[0] ?? "", { font: 2, size: 11 });
  y -= 14;
  const n = Math.max(sellerLines.length, clientLines.length);
  for (let i = 1; i < n; i++) {
    if (sellerLines[i]) p.text(LEFT, y, sellerLines[i], { size: 9, color: MUTED });
    if (clientLines[i]) p.text(320, y, clientLines[i], { size: 9, color: MUTED });
    y -= 13;
  }
  y -= 6;
  p.rule(LEFT, y, RIGHT);
  y -= 14;
  for (const m of orderMeta) {
    p.text(LEFT, y, m, { size: 9, color: MUTED });
    y -= 13;
  }
  return y;
}

const COL_QTY = 372;
const COL_PU = 462;
const COL_TOTAL = RIGHT;

function drawTableHeader(p: Page, y: number) {
  p.rect(LEFT, y - 6, RIGHT - LEFT, 20, BAND_BG);
  p.text(LEFT + 8, y, "Désignation", { font: 2, size: 9, color: BAND_FG });
  p.text(COL_QTY, y, "Qté", { font: 2, size: 9, color: BAND_FG, align: "right" });
  p.text(COL_PU, y, "PU TTC", { font: 2, size: 9, color: BAND_FG, align: "right" });
  p.text(COL_TOTAL, y, "Total", { font: 2, size: 9, color: BAND_FG, align: "right" });
  return y - 6;
}

function drawFooter(p: Page, pageNum: number, pageCount: number, invoiceNo: string, emissionDate: string) {
  const y0 = 52;
  p.rule(LEFT, y0 + 26, RIGHT);
  p.text(LEFT, y0 + 14, `${SELLER.legal} — ${SELLER.address}, ${SELLER.city} — SIREN : ${SELLER.siret}`, {
    size: 7.5,
    color: MUTED,
    maxWidth: RIGHT - LEFT,
  });
  p.text(LEFT, y0 + 4, `Contact : ${SELLER.email} — TVA incluse dans les montants. Document généré le ${emissionDate}.`, {
    size: 7.5,
    color: MUTED,
    maxWidth: RIGHT - LEFT - 60,
  });
  p.text(RIGHT, y0 + 4, `Page ${pageNum}/${pageCount} — ${invoiceNo}`, {
    size: 7.5,
    color: MUTED,
    align: "right",
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Commande invalide." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: orderData } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!orderData) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  const row = orderData as unknown as OrderRow;

  const adminOk = await isAdmin().catch(() => false);
  if (!adminOk) {
    try {
      const supabase = await createSupabaseServer();
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      const ownerId = row.user_id ? String(row.user_id) : null;
      if (!uid || uid !== ownerId) {
        return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }
  }

  const { data: itemRows } = await admin.from("order_items").select("*").eq("order_id", orderId);
  const items = Array.isArray(itemRows) ? (itemRows as unknown as OrderItemRow[]) : [];
  const order = mapOrder(row, items);
  const invoiceNo = order.invoiceNumber ?? `${new Date().getFullYear()}-${String(order.id).padStart(6, "0")}`;
  const emissionDate = formatDate(Date.now());
  const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const carrierLabel = order.carrier === "relais" ? "Point relais" : "Domicile";

  const sellerLines = [SELLER.name, SELLER.legal, SELLER.address, SELLER.city, `SIREN : ${SELLER.siret}`, SELLER.email];
  const clientLines = [
    order.customerName || "Client",
    order.customerEmail,
    order.addressLine1,
    `${order.addressPostalCode} ${order.addressCity}`.trim(),
    order.addressCountry,
  ].filter(Boolean);
  const orderMeta = [
    `Commande n° ${order.id} — passée le ${formatDate(order.createdAt)}`,
    `Statut : ${ORDER_STATUS_LABELS[order.status] ?? order.status} — Paiement : Stripe (carte)`,
    order.promoCode ? `Code promo appliqué : ${order.promoCode}` : "Aucun code promo",
  ];

  // Pagination des lignes d'articles.
  const FIRST_ROWS = 16;
  const NEXT_ROWS = 26;
  const chunks: typeof order.items[] = [];
  let rest = [...order.items];
  let first = true;
  while (rest.length > 0) {
    const take = first ? FIRST_ROWS : NEXT_ROWS;
    chunks.push(rest.slice(0, take));
    rest = rest.slice(take);
    first = false;
  }
  if (chunks.length === 0) chunks.push([]);
  const pageCount = chunks.length;

  const totals: { label: string; value: string; strong?: boolean }[] = [
    { label: "Sous-total", value: formatPrice(subtotal) },
  ];
  if (order.discountAmount > 0) {
    totals.push({
      label: `Remise${order.promoCode ? ` (${order.promoCode})` : ""}`,
      value: `−${formatPrice(order.discountAmount)}`,
    });
  }
  totals.push({ label: `Livraison — ${carrierLabel}`, value: formatPrice(order.shippingPrice) });

  const pages: Page[] = chunks.map((rows, pageIdx) => {
    const p = new Page();
    drawHeader(p, invoiceNo, emissionDate);
    let y = 842 - TOP_BAND_H - 26;
    if (pageIdx === 0) {
      y = drawParties(p, y, sellerLines, clientLines, orderMeta);
      y -= 8;
    } else {
      p.text(LEFT, y, `Facture ${invoiceNo} — suite`, { size: 9, color: MUTED });
      y -= 18;
    }
    y = drawTableHeader(p, y);
    let zebra = false;
    for (const item of rows) {
      y -= 19;
      if (zebra) p.rect(LEFT, y - 5, RIGHT - LEFT, 19, ZEBRA);
      p.text(LEFT + 8, y, item.productName, { size: 9.5, maxWidth: COL_QTY - LEFT - 30 });
      p.text(COL_QTY, y, String(item.quantity), { size: 9.5, align: "right" });
      p.text(COL_PU, y, formatPrice(item.unitPrice), { size: 9.5, align: "right" });
      p.text(COL_TOTAL, y, formatPrice(item.unitPrice * item.quantity), {
        font: 2,
        size: 9.5,
        align: "right",
      });
      p.rule(LEFT, y - 5, RIGHT, LINE, 0.5);
      zebra = !zebra;
    }
    if (pageIdx === pageCount - 1) {
      y -= 26;
      for (const t of totals) {
        p.text(330, y, t.label, { size: 10, color: MUTED });
        p.text(COL_TOTAL, y, t.value, { size: 10, align: "right" });
        y -= 16;
      }
      y -= 4;
      p.rect(330, y - 8, COL_TOTAL - 330, 26, BAND_BG);
      p.text(338, y + 4, "TOTAL TTC", { font: 2, size: 11, color: BAND_FG });
      p.text(COL_TOTAL - 8, y + 4, formatPrice(order.amountTotal), {
        font: 2,
        size: 12,
        color: BAND_FG,
        align: "right",
      });
    }
    drawFooter(p, pageIdx + 1, pageCount, invoiceNo, emissionDate);
    return p;
  });

  const pdf = assemble(pages);
  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${invoiceNo}.pdf"`,
    },
  });
}
