import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/schemas/message";

export async function saveProjectMessage(projectId: string, message: Message): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    role: message.role,
    content: message.content,
  });

  if (error) {
    throw new Error(`Kunne ikke gemme besked: ${error.message}`);
  }
}
