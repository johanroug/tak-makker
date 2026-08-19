import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();

  const response = await openai.responses.create({    
    model: "gpt-5.6-luna",
    input: `
Du er assistent for en dansk håndværker.

Udtræk oplysningerne fra følgende beskrivelse:

"${body.description}"

Returner kun JSON i dette format:

{
  "customer": {
    "name": ""
  },
  "project": {
    "title": "",
    "description": ""
  },
  "price": {
    "amount": 0,
    "vatIncluded": false
  }
}
`,
  });

  return Response.json({
    result: response.output_text,
  });
}