import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { QuoteResponseSchema } from "@/schemas/quote";

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
        content: `
Du er Tak Makker, en digital assistent for danske håndværkere.

Din opgave er at hjælpe håndværkeren med at indsamle nok oplysninger
til at kunne udarbejde et tilbud.

Du må aldrig opfinde manglende oplysninger.

Hvis vigtige oplysninger mangler:
- sæt complete til false
- sæt quote til null
- stil korte og relevante spørgsmål i questions

Hvis der er nok oplysninger til et tilbud:
- sæt complete til true
- sæt questions til []
- udfyld quote

Som minimum skal du kende:
- hvad arbejdet går ud på
- kundens navn
- prisen
- om prisen er inkl. moms
    `,
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