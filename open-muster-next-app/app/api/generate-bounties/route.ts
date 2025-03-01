import { NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { repoUrl, roadmap } = await req.json()

    if (!repoUrl || !roadmap) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that generates bounty suggestions based on GitHub repository information and project roadmap.",
        },
        {
          role: "user",
          content: `Generate 3 bounty suggestions for the following project:
            Repository URL: ${repoUrl}
            Project Roadmap: ${roadmap}
            
            For each bounty, provide a title and a brief description.`,
        },
      ],
    })

    const suggestedBounties = completion.choices[0].message.content.split("\n\n").map((bounty) => {
      const [title, ...descriptionParts] = bounty.split("\n")
      return {
        title: title.replace(/^\d+\.\s*/, ""),
        description: descriptionParts.join("\n").trim(),
      }
    })

    return NextResponse.json({ success: true, bounties: suggestedBounties })
  } catch (error) {
    console.error("Error in generate-bounties API:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

