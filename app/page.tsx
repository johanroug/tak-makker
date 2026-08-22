"use client";

import { useState } from "react";
import type { QuoteResponse, WorkItem } from "@/schemas/quote";
import type { Message } from "@/types/message";
import styles from "./page.module.scss";
import QuoteInput from "./components/QuoteInput/QuoteInput";
import Conversation from "./components/Conversation/Conversation";
import QuoteResult from "./components/QuoteResult/QuoteResult";
import WorkItems from "./components/WorkItems/WorkItems";

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
        workItems: quoteResponse?.workItems ?? [],
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

  function handleWorkItemChange(
    workItem: WorkItem,
    accepted: boolean
  ) {
    if (!quoteResponse) {
      return;
    }

    const updatedWorkItems: WorkItem[] = quoteResponse.workItems.map((item) => {
      if (item !== workItem) {
        return item;
      }

      return {
        ...item,
        status: accepted ? "accepted" : "rejected",
      };
    });

    setQuoteResponse({
      ...quoteResponse,
      workItems: updatedWorkItems,
    });
  }

  return (
    <main className={styles.page}>
      <div
        className={`${styles.container} ${conversationStarted ? styles.conversationStarted : ""
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
            <QuoteInput description={description} onDescriptionChange={setDescription} onSubmit={createQuote} />
          </section>

          <section className={styles.conversationColumn}>
            <Conversation messages={messages} />
            {quoteResponse && (
              <WorkItems
                workItems={quoteResponse.workItems}
                onWorkItemChange={handleWorkItemChange}
              />
            )}
            <QuoteResult quoteResponse={quoteResponse} />
          </section>
        </div>
      </div>
    </main>
  );
}