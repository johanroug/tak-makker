import type { Message } from "@/types/message";
import styles from "./Conversation.module.scss";

type ConversationProps = {
  messages: Message[];
};

export default function Conversation({
  messages,
}: ConversationProps) {
  return (
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
            {message.role === "user" ? "Dig" : "Tak Makker"}:
          </strong>

          <p className={styles.messageText}>
            {message.content}
          </p>
        </div>
      ))}
    </div>
  );
}