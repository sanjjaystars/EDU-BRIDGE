import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, language, difficulty, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const difficultyMap: Record<string, string> = {
      school: "a young school student (ages 10-14). Use very simple words and short sentences.",
      college: "a college student. Use clear academic language with proper terminology.",
      exam: "someone preparing for competitive exams. Be comprehensive and include key facts, formulas, and mnemonics.",
    };

    const languageInstruction = language !== "english"
      ? `\n\nIMPORTANT: Write the ENTIRE response in ${language}. Do not use English at all.`
      : "";

    let systemPrompt = "";
    if (mode === "explain") {
      systemPrompt = `You are EduBridge AI, an expert educational content simplifier. Explain the given content as if explaining to ${difficultyMap[difficulty] || difficultyMap.school}${languageInstruction}

Provide a clear, well-structured explanation. Use analogies and examples where helpful.`;
    } else if (mode === "summary") {
      systemPrompt = `You are EduBridge AI, an expert summarizer. Create a concise bullet-point summary of the given content, suitable for ${difficultyMap[difficulty] || difficultyMap.school}${languageInstruction}

Format as clear bullet points with key takeaways. Group related points together.`;
    } else if (mode === "quiz") {
      systemPrompt = `You are EduBridge AI, a quiz generator. Based on the given content, generate 5 multiple-choice questions suitable for ${difficultyMap[difficulty] || difficultyMap.school}${languageInstruction}

Format each question as:
Q1. [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Answer: [Letter]

Include a mix of easy and challenging questions.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.slice(0, 12000) },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No output generated.";

    return new Response(JSON.stringify({ result: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
