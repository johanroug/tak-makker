"use client";

import { useState } from "react";
import type { QuoteResponse } from "@/schemas/quote";
import type { Message } from "@/types/message";
import styles from "./page.module.scss";

export default function Home() {
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null);

  async function createQuote() {
    const userMessage: Message = {
      role: "user",
      content: description,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    const response = await fetch("/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    });

    const generatedResponse: QuoteResponse = await response.json();

    setQuoteResponse(generatedResponse);

    if (!generatedResponse.complete) {
      const assistantMessage: Message = {
        role: "assistant",
        content: generatedResponse.questions.join("\n"),
      };

      setMessages([
        ...updatedMessages,
        assistantMessage,
      ]);
    }

    setDescription("");
  }

  const conversationStarted = messages.length > 0;

  return (
    <main className={styles.page}>
      <div
        className={`${styles.container} ${
          conversationStarted ? styles.conversationStarted : ""
        }`}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>Tak Makker</h1>

          <p className={styles.subtitle}>
            Din digitale makker på jobbet.
          </p>
        </header>

        <div className={styles.workspace}>
          <section className={styles.inputColumn}>
            <div className={styles.inputCard}>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fortæl hvad du skal lave..."
              />

              <button
                className={styles.button}
                onClick={createQuote}
              >
                Lav tilbud
              </button>
            </div>
          </section>

          <section className={styles.conversationColumn}>
            <div className={styles.messages}>
              {messages.toReversed().map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage
                  }
                >
                  <strong>
                    {message.role === "user"
                      ? "Dig"
                      : "Tak Makker"}
                    :
                  </strong>

                  <p className={styles.messageText}>
                    {message.content}
                  </p>
                </div>
              ))}
            </div>

            {quoteResponse && !quoteResponse.complete && (
              <section className={styles.questions}>
                <h2>Jeg mangler lige lidt, makker</h2>

                {quoteResponse.questions.map((question) => (
                  <p key={question}>{question}</p>
                ))}
              </section>
            )}

            {quoteResponse?.complete && quoteResponse.quote && (
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
            )}
          </section>
        </div>
      </div>
    </main>
  );
}