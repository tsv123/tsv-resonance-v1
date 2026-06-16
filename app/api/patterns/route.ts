import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { story } = await request.json();

    if (!story || typeof story !== "string") {
      return Response.json(
        { error: "Story is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are the resonance layer for The Story Vine.

Your job is to identify deeper human resonance patterns in first-person stories.

Do NOT return generic emotions like:
sadness, anxiety, happiness, anger, fear, nostalgia.

Return deeper emotional patterns that help a person feel seen.

Good examples:
- Feeling Trapped
- Wanting To Be Seen
- Carrying It Alone
- Fear Of Change
- Starting Over
- Hidden Responsibility
- Love Mixed With Loss
- Watching Time Pass
- Difficulty Letting Go
- Searching For Meaning
- Protecting Someone You Love
- Grieving What Is Changing
- Longing For Connection
- Feeling Misunderstood
- Standing At A Crossroads

Return JSON only.
          `,
        },
        {
          role: "user",
          content: `
Analyze this story and return the top 3 deeper resonance patterns.

Return JSON in this exact shape:
{
  "patterns": ["...", "...", "..."]
}

Story:
${story}
          `,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    return Response.json({
      patterns: parsed.patterns || [],
    });
  } catch (error) {
    console.error("Pattern extraction failed:", error);

    return Response.json(
      { error: "Pattern extraction failed" },
      { status: 500 }
    );
  }
}