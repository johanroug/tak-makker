"use client";

import { useState } from "react";
import { Quote } from "../types/quote";

export default function Home() {
  const [description, setDescription] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);

  function createQuote() {
    const fakeQuote: Quote = {
      customer: {
        name: "Jens Hansen",
      },
      project: {
        title: "Ny terrasse",
        description: description,
      },
      price: {
        amount: 85000,
        vatIncluded: false,
      },
    };

    setQuote(fakeQuote);
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