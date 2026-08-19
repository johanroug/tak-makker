"use client";

import { useState } from "react";
import type { Quote } from "@/schemas/quote";

export default function Home() {
  const [description, setDescription] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);

  async function createQuote() {
    const response = await fetch("/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
      }),
    });

    const generatedQuote: Quote = await response.json();

    setQuote(generatedQuote);
  }

  return (
    <main>
      <h1>Tak Makker</h1>
      <p>Hvad skal vi hjælpe dig med?</p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Fortæl hvad du skal lave..."
        rows={8}
      />

      <button onClick={createQuote}>
        Lav tilbud
      </button>

      {quote && (
        <div>
          <h2>{quote.project.title}</h2>

          <p>
            <strong>Kunde:</strong> {quote.customer.name}
          </p>

          <p>
            <strong>Beskrivelse:</strong> {quote.project.description}
          </p>

          <p>
            <strong>Pris:</strong> {quote.price.amount} kr.
          </p>
        </div>
      )}
    </main>
  );
}