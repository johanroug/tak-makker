import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ProjectResponseSchema } from "@/schemas/project";
import { aiInstructions } from "../../lib/ai/instructions";
import { createWorkItemsContext } from "@/app/lib/ai/work-items-context";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();

  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: aiInstructions,
      },
      {
        role: "system",
        content: createWorkItemsContext(body.workItems),
      },
      ...body.messages,
    ],

    text: {
      format: zodTextFormat(
        ProjectResponseSchema,
        "quote_response"
      ),
    },
  });

  return Response.json(response.output_parsed);
}