import type { Offer } from "@/schemas/offer";

function createOfferFilename(projectTitle: string) {
  const slug = projectTitle
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("da-DK")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug ? `tilbud-${slug}.pdf` : "tilbud.pdf";
}

export async function downloadOfferPdf(offer: Offer) {
  const response = await fetch("/api/offers/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });

  if (!response.ok) throw new Error("PDF generation failed");

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = createOfferFilename(offer.project.title);
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
