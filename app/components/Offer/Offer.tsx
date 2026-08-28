import type { Offer as OfferSnapshot } from "@/schemas/offer";
import { formatMoney } from "@/lib/format-money";

type OfferProps = {
  offer: OfferSnapshot;
};

export default function Offer({ offer }: OfferProps) {
  const workItemGroups = Array.from(
    offer.workItems.reduce((groups, item) => {
      const items = groups.get(item.trade) ?? [];
      groups.set(item.trade, [...items, item]);
      return groups;
    }, new Map<string, OfferSnapshot["workItems"]>()),
    ([trade, items]) => ({ trade, items }),
  );

  return (
    <section className="mt-6">
      <h2 className="section-heading">Tilbud</h2>

      <div className="card card-stack">
        <div>
          <h3 className="text-lg font-semibold leading-7">{offer.project.title}</h3>
          <p className="mt-1 text-sm text-neutral-600">{offer.customer.name}</p>
          <p className="mt-3 leading-6">{offer.project.description}</p>
        </div>

        <div className="mt-2 border-t border-neutral-200 pt-4">
          <h3 className="card-title mb-3">Arbejde</h3>

          <div className="card-stack">
            {workItemGroups.map((group) => (
              <div key={group.trade}>
                <strong>{group.trade}</strong>

                <div className="card-stack mt-2">
                  {group.items.map((item) => (
                    <div className="flex items-start justify-between gap-4" key={item.id}>
                      <div>
                        <p className="text-sm leading-5 text-neutral-600">{item.description}</p>
                      </div>

                      <div className="shrink-0 text-right text-sm whitespace-nowrap">
                        <div>{item.estimatedHours.toLocaleString("da-DK")} timer</div>
                        <strong>{formatMoney(item.totalPrice)}</strong>
                      </div>
                    </div>
                  ))}
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
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <span>Arbejdsløn</span>
              <strong className="shrink-0 whitespace-nowrap font-semibold">
                {formatMoney(offer.pricing.labor)}
              </strong>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span>Materialer</span>
              <strong className="shrink-0 whitespace-nowrap font-semibold">
                {formatMoney(offer.pricing.materials)}
              </strong>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between gap-4">
              <span>Subtotal</span>
              <strong className="shrink-0 whitespace-nowrap font-semibold">
                {formatMoney(offer.pricing.subtotal)}
              </strong>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span>Moms ({offer.pricing.vatRate * 100} %)</span>
              <strong className="shrink-0 whitespace-nowrap font-semibold">
                {formatMoney(offer.pricing.vatAmount)}
              </strong>
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-neutral-200 pt-4 text-xl">
            <strong>Total inkl. moms</strong>
            <strong className="shrink-0 whitespace-nowrap">{formatMoney(offer.pricing.total)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
