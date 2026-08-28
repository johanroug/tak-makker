import type { Offer as OfferSnapshot } from "@/schemas/offer";
import { formatMoney } from "@/lib/format-money";

type OfferProps = {
  offer: OfferSnapshot;
};

export default function Offer({ offer }: OfferProps) {
  return (
    <section className="mt-6">
      <h2 className="section-heading">Tilbud</h2>

      <div className="card card-stack">
        <div>
          <strong className="card-title">Kunde</strong>
          <p>{offer.customer.name}</p>
        </div>

        <div>
          <strong className="card-title">{offer.project.title}</strong>
          <p className="leading-6">{offer.project.description}</p>
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <h3 className="card-title mb-3">Arbejde</h3>

          <div className="card-stack">
            {offer.workItems.map((item) => (
              <div className="flex items-start justify-between gap-4" key={item.id}>
                <div>
                  <strong>{item.trade}</strong>
                  <p className="mt-1 text-sm leading-5 text-neutral-600">{item.description}</p>
                </div>

                <div className="shrink-0 text-right text-sm">
                  <div>{item.estimatedHours.toLocaleString("da-DK")} timer</div>
                  <strong>{formatMoney(item.totalPrice)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {offer.materials.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="card-title mb-3">Materialer</h3>

            <div className="card-stack">
              {offer.materials.map((material) => (
                <div className="flex items-start justify-between gap-4" key={material.id}>
                  <div>
                    <strong>{material.name}</strong>
                    <p className="mt-1 text-sm leading-5 text-neutral-600">
                      {material.description}
                    </p>
                    <small className="text-neutral-500">
                      {material.quantity.toLocaleString("da-DK")} {material.unit} ×{" "}
                      {formatMoney(material.unitPrice)}
                    </small>
                  </div>

                  <strong className="shrink-0 text-sm">{formatMoney(material.totalPrice)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-stack border-t border-neutral-200 pt-4">
          <div className="flex justify-between gap-4">
            <span>Arbejdsløn</span>
            <strong>{formatMoney(offer.pricing.labor)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Materialer</span>
            <strong>{formatMoney(offer.pricing.materials)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <strong>{formatMoney(offer.pricing.subtotal)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Moms ({offer.pricing.vatRate * 100} %)</span>
            <strong>{formatMoney(offer.pricing.vatAmount)}</strong>
          </div>
          <div className="flex justify-between gap-4 text-lg">
            <strong>Total inkl. moms</strong>
            <strong>{formatMoney(offer.pricing.total)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
