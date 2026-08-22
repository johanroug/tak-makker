import type { ProjectResponse } from "@/schemas/project";
import styles from "./QuoteResult.module.scss";

type QuoteResultProps = {
  projectResponse: ProjectResponse | null;
};

export default function QuoteResult({
  projectResponse,
}: QuoteResultProps) {
  if (!projectResponse) {
    return null;
  }

  if (!projectResponse.complete) {
    return (
      <section className={styles.questions}>
        <h2>Jeg mangler lige lidt, makker</h2>

        {projectResponse.questions.map((question) => (
          <p key={question}>{question}</p>
        ))}
      </section>
    );
  }

  if (!projectResponse.quote) {
    return null;
  }

  return (
    <section className={styles.result}>
      <h2>{projectResponse.quote.project.title}</h2>

      <p>
        <strong>Kunde:</strong>{" "}
        {projectResponse.quote.customer.name}
      </p>

      <p>
        <strong>Beskrivelse:</strong>{" "}
        {projectResponse.quote.project.description}
      </p>

      <p>
        <strong>Pris:</strong>{" "}
        {projectResponse.quote.price.amount} kr.
      </p>
    </section>
  );
}