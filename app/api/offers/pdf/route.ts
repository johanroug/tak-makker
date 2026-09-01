import { generateOfferPdf } from "@/lib/offers/pdf/generateOfferPdf";
import { OfferSchema } from "@/schemas/offer";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  const parsedOffer = OfferSchema.safeParse(body);
  if (!parsedOffer.success) {
    return Response.json({ error: "Tilbuddet er ugyldigt." }, { status: 400 });
  }

  try {
    const pdfBytes = await generateOfferPdf(parsedOffer.data);
    const responseBody = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(responseBody).set(pdfBytes);
    return new Response(responseBody, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=tilbud.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "PDF-filen kunne ikke genereres." }, { status: 500 });
  }
}
