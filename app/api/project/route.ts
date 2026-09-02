import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ProjectResponseSchema } from "@/schemas/project";
import { aiInstructions } from "@/lib/ai/instructions";
import { createWorkItemsContext } from "@/lib/ai/work-items-context";
import { createMaterialsContext } from "@/lib/ai/materials-context";
import { createProjectDetailsContext } from "@/lib/ai/project-details-context";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
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
          content: createProjectDetailsContext({
            customer: body.customer ?? { name: null, address: null },
            project: body.project ?? {
              title: null,
              description: null,
              offerDescription: null,
            },
          }),
        },
        {
          role: "system",
          content: createWorkItemsContext(body.workItems ?? []),
        },
        {
          role: "system",
          content: createMaterialsContext(body.materials ?? []),
        },
        ...body.messages,
      ],
      text: {
        format: zodTextFormat(ProjectResponseSchema, "project_response"),
      },
    });

    return Response.json(response.output_parsed);
  } catch (error) {
    console.error("PROJECT API ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
