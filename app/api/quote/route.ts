import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { QuoteSchema } from "@/schemas/quote";

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
        content:
          "Du er assistent for en dansk håndværker. Udtræk oplysninger til et tilbud fra brugerens beskrivelse.",
      },
      {
        role: "user",
        content: body.description,
      },
    ],

    text: {
      format: zodTextFormat(QuoteSchema, "quote"),
    },
  });

  return Response.json(response.output_parsed);
}