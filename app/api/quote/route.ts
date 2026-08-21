import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { QuoteResponseSchema } from "@/schemas/quote";
import { aiInstructions } from "../../lib/ai/ai-instructions";

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
      ...body.messages,
    ],

    text: {
      format: zodTextFormat(
        QuoteResponseSchema,
        "quote_response"
      ),
    },
  });

  return Response.json(response.output_parsed);
}