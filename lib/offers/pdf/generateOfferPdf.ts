import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { formatMoney } from "@/lib/format-money";
import type { Offer } from "@/schemas/offer";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 52;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = 52;
const TEXT_COLOR = rgb(0.12, 0.15, 0.18);
const MUTED_COLOR = rgb(0.38, 0.42, 0.46);
const ACCENT_COLOR = rgb(0.12, 0.29, 0.38);
const DIVIDER_COLOR = rgb(0.78, 0.82, 0.84);
const TOTAL_FILL_COLOR = rgb(0.94, 0.96, 0.97);

type PdfContext = {
  document: PDFDocument;
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  y: number;
};

function safeText(text: string, font: PDFFont) {
  return Array.from(text)
    .map((character) => {
      if (character === "\n") return character;
      try {
        font.encodeText(character);
        return character;
      } catch {
        return "?";
      }
    })
    .join("");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const sanitized = safeText(text, font);
  const lines: string[] = [];

  for (const paragraph of sanitized.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      let fragment = "";
      for (const character of word) {
        const candidateFragment = fragment + character;
        if (font.widthOfTextAtSize(candidateFragment, size) <= maxWidth) {
          fragment = candidateFragment;
        } else {
          if (fragment) lines.push(fragment);
          fragment = character;
        }
      }
      line = fragment;
    }
    lines.push(line);
  }
  return lines.length > 0 ? lines : [""];
}

function addPage(context: PdfContext) {
  context.page = context.document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  context.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(context: PdfContext, height: number) {
  if (context.y - height < BOTTOM_MARGIN) addPage(context);
}

function formatOfferDate(createdAt: string | null) {
  if (createdAt === null) return "Ukendt";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Copenhagen",
  }).format(date);
}

function drawTextBlock(
  context: PdfContext,
  text: string,
  options: {
    font?: PDFFont;
    size?: number;
    lineHeight?: number;
    color?: ReturnType<typeof rgb>;
    indent?: number;
    maxWidth?: number;
  } = {},
) {
  const font = options.font ?? context.regular;
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size * 1.45;
  const indent = options.indent ?? 0;
  const lines = wrapText(text, font, size, options.maxWidth ?? CONTENT_WIDTH - indent);
  for (const line of lines) {
    ensureSpace(context, lineHeight);
    context.page.drawText(line, {
      x: MARGIN + indent,
      y: context.y - size,
      size,
      font,
      color: options.color ?? TEXT_COLOR,
    });
    context.y -= lineHeight;
  }
}

function drawSectionHeading(context: PdfContext, heading: string) {
  ensureSpace(context, 58);
  context.y -= 18;
  drawTextBlock(context, heading.toLocaleUpperCase("da-DK"), {
    font: context.bold,
    size: 11,
    lineHeight: 17,
    color: ACCENT_COLOR,
  });
  context.page.drawLine({
    start: { x: MARGIN, y: context.y },
    end: { x: PAGE_WIDTH - MARGIN, y: context.y },
    thickness: 0.8,
    color: DIVIDER_COLOR,
  });
  context.y -= 10;
}

function drawPriceRow(context: PdfContext, label: string, value: string, emphasized = false) {
  const font = emphasized ? context.bold : context.regular;
  const size = emphasized ? 12 : 10;
  const safeValue = safeText(value, font);
  ensureSpace(context, 22);
  context.page.drawText(safeText(label, font), {
    x: MARGIN,
    y: context.y - size,
    size,
    font,
    color: TEXT_COLOR,
  });
  context.page.drawText(safeValue, {
    x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(safeValue, size),
    y: context.y - size,
    size,
    font,
    color: TEXT_COLOR,
  });
  context.y -= emphasized ? 24 : 19;
}

export async function generateOfferPdf(offer: Offer): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const context: PdfContext = {
    document,
    page: document.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    regular,
    bold,
    y: PAGE_HEIGHT - MARGIN,
  };

  drawTextBlock(context, offer.company.companyName, {
    font: bold,
    size: 16,
    lineHeight: 21,
    color: ACCENT_COLOR,
  });
  drawTextBlock(context, `CVR ${offer.company.cvr}`, {
    size: 9,
    lineHeight: 13,
    color: MUTED_COLOR,
  });
  drawTextBlock(
    context,
    [offer.company.contactName, offer.company.phone, offer.company.email].filter(Boolean).join(" · "),
    { size: 9, lineHeight: 13, color: MUTED_COLOR },
  );

  context.y -= 20;
  context.page.drawLine({
    start: { x: MARGIN, y: context.y },
    end: { x: PAGE_WIDTH - MARGIN, y: context.y },
    thickness: 1.2,
    color: ACCENT_COLOR,
  });
  context.y -= 18;
  drawTextBlock(context, "TILBUD", {
    font: bold,
    size: 27,
    lineHeight: 33,
    color: ACCENT_COLOR,
  });
  drawTextBlock(context, `Dato: ${formatOfferDate(offer.createdAt)}`, {
    size: 9.5,
    lineHeight: 14,
    color: MUTED_COLOR,
  });

  context.y -= 20;
  drawTextBlock(context, offer.project.title, { font: bold, size: 18, lineHeight: 25 });
  drawTextBlock(context, `Kunde: ${offer.customer.name}`, {
    size: 10,
    lineHeight: 16,
    color: MUTED_COLOR,
  });
  context.y -= 10;
  drawTextBlock(context, offer.project.description, { size: 10.5, lineHeight: 17 });
  context.y -= 6;

  ensureSpace(context, 102);
  drawSectionHeading(context, "Arbejde");
  const workGroups = Array.from(
    offer.workItems.reduce((groups, item) => {
      groups.set(item.trade, [...(groups.get(item.trade) ?? []), item]);
      return groups;
    }, new Map<string, Offer["workItems"]>()),
  );
  for (const [trade, items] of workGroups) {
    ensureSpace(context, 44);
    drawTextBlock(context, trade, {
      font: bold,
      size: 11.5,
      lineHeight: 18,
      color: ACCENT_COLOR,
    });
    for (const item of items) {
      drawTextBlock(context, `• ${item.description}`, {
        size: 10,
        lineHeight: 15,
        indent: 10,
      });
      context.y -= 3;
    }
    context.y -= 5;
  }

  const hasMaterials = offer.materials.length > 0 && offer.pricing.materials > 0;
  if (hasMaterials) {
    ensureSpace(context, 106);
    drawSectionHeading(context, "Materialer");
    for (const material of offer.materials) {
      ensureSpace(context, 48);
      drawTextBlock(context, material.name, { font: bold, size: 10.5, lineHeight: 16 });
      if (material.description) {
        drawTextBlock(context, material.description, { size: 9.5, lineHeight: 14 });
      }
      drawTextBlock(
        context,
        `${material.quantity.toLocaleString("da-DK")} ${material.unit} × ${formatMoney(material.unitPrice)} — ${formatMoney(material.totalPrice)}`,
        { size: 9, lineHeight: 14, color: MUTED_COLOR },
      );
      context.y -= 6;
    }
  }

  ensureSpace(context, hasMaterials ? 218 : 198);
  drawSectionHeading(context, "Pris");
  drawPriceRow(context, "Arbejde", formatMoney(offer.pricing.labor));
  if (hasMaterials) {
    drawPriceRow(context, "Materialer", formatMoney(offer.pricing.materials));
  }
  drawPriceRow(context, "Subtotal", formatMoney(offer.pricing.subtotal));
  drawPriceRow(
    context,
    `Moms (${(offer.pricing.vatRate * 100).toLocaleString("da-DK")} %)`,
    formatMoney(offer.pricing.vatAmount),
  );
  context.y -= 8;
  context.page.drawLine({
    start: { x: MARGIN, y: context.y },
    end: { x: PAGE_WIDTH - MARGIN, y: context.y },
    thickness: 1,
    color: ACCENT_COLOR,
  });
  context.y -= 12;
  ensureSpace(context, 42);
  context.page.drawRectangle({
    x: MARGIN,
    y: context.y - 34,
    width: CONTENT_WIDTH,
    height: 38,
    color: TOTAL_FILL_COLOR,
    borderColor: DIVIDER_COLOR,
    borderWidth: 0.7,
  });
  context.y -= 7;
  drawPriceRow(context, "TOTAL INKL. MOMS", formatMoney(offer.pricing.total), true);

  document.setTitle(`Tilbud - ${offer.project.title}`);
  document.setAuthor(offer.company.companyName);
  document.setCreator("Tak Makker");
  return document.save();
}
