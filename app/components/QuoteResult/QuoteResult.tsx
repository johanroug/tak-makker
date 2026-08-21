import type { QuoteResponse } from "@/schemas/quote";
import styles from "./QuoteResult.module.scss";

type QuoteResultProps = {
  quoteResponse: QuoteResponse | null;
};

export default function QuoteResult({
  quoteResponse,
}: QuoteResultProps) {
  if (!quoteResponse) {
    return null;
  }

  if (!quoteResponse.complete) {
    return (
      <section className={styles.questions}>
        <h2>Jeg mangler lige lidt, makker</h2>

        {quoteResponse.questions.map((question) => (
          <p key={question}>{question}</p>
        ))}
      </section>
    );
  }

  if (!quoteResponse.quote) {
    return null;
  }

  return (
    <section className={styles.result}>
      <h2>{quoteResponse.quote.project.title}</h2>

      <p>
        <strong>Kunde:</strong>{" "}
        {quoteResponse.quote.customer.name}
      </p>

      <p>
        <strong>Beskrivelse:</strong>{" "}
        {quoteResponse.quote.project.description}
      </p>

      <p>
        <strong>Pris:</strong>{" "}
        {quoteResponse.quote.price.amount} kr.
      </p>
    </section>
  );
}