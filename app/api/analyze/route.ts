import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DAILY_LIMIT_PER_IP = 5;
const GLOBAL_DAILY_LIMIT = Number(process.env.MAX_DAILY_ANALYSIS || 200);
const MAX_TEXT_LENGTH = 4000;

// In-memory store for demo use only.
// Resets when server restarts or redeploys.
const ipUsage: Record<string, { count: number; date: string }> = {};
let globalUsage = { count: 0, date: new Date().toISOString().slice(0, 10) };

export async function POST(req: Request) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Reset global counter each new day
    if (globalUsage.date !== today) {
      globalUsage = { count: 0, date: today };
    }

    // Get IP safely
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Reset per-IP counter each new day
    if (!ipUsage[ip] || ipUsage[ip].date !== today) {
      ipUsage[ip] = { count: 0, date: today };
    }

    // Enforce per-IP daily limit
    if (ipUsage[ip].count >= DAILY_LIMIT_PER_IP) {
      return Response.json(
        {
          error: `Daily limit reached. You can run up to ${DAILY_LIMIT_PER_IP} checks per day.`,
        },
        { status: 429 }
      );
    }

    // Enforce global daily cap
    if (globalUsage.count >= GLOBAL_DAILY_LIMIT) {
      return Response.json(
        {
          error: "Tool temporarily paused due to heavy traffic. Please try again tomorrow.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { jobDescription, resume } = body as {
      jobDescription?: string;
      resume?: string;
    };

    if (!jobDescription || !resume) {
      return Response.json(
        { error: "Missing jobDescription or resume." },
        { status: 400 }
      );
    }

    // Trim very long inputs to control cost
    jobDescription = jobDescription.slice(0, MAX_TEXT_LENGTH);
    resume = resume.slice(0, MAX_TEXT_LENGTH);

    // Increment counters only after validation passes
    ipUsage[ip].count += 1;
    globalUsage.count += 1;

    const prompt = `
Compare this resume against this job description.

Return in plain text with these sections:
1. Match Score out of 100
2. Top Matching Skills
3. Missing Skills
4. 3 Resume Improvement Tips

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return Response.json({
      output: response.output_text || "No output returned.",
      remainingToday: Math.max(0, DAILY_LIMIT_PER_IP - ipUsage[ip].count),
    });
  } catch (error: any) {
    console.error("API Route Error:", error);

    return Response.json(
      {
        error: error?.message || "Something went wrong in /api/analyze.",
      },
      { status: 500 }
    );
  }
}
