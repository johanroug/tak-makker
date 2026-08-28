import type { Message } from "@/schemas/message";
import styles from "./Conversation.module.scss";

type ConversationProps = {
  messages: Message[];
};

export default function Conversation({ messages }: ConversationProps) {
  return (
    <div className="card-stack">
      {messages.toReversed().map((message, index) => (
        <div
          key={index}
          className={`card max-w-[85%] ${
            message.role === "user" ? "self-end " + styles.userMessage : "self-start"
          }`}
        >
          <strong className="card-title">{message.role === "user" ? "Dig" : "Tak Makker"}</strong>

          <p className={styles.messageText}>{message.content}</p>
        </div>
      ))}
    </div>
  );
}
