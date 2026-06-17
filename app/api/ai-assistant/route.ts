import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  const systemPrompt = `You are YTE Engineer, an expert AI assistant for Young Technology Engineers. 
You specialize in electrical installations, solar systems, borehole systems, plumbing, smart home automation, and general engineering.

When someone describes an engineering problem, always respond with:
1. 🔍 DIAGNOSIS - What the problem likely is
2. ⚠️ POSSIBLE CAUSES - List the main causes
3. 🔧 TROUBLESHOOTING STEPS - Step by step solution
4. 🛡️ SAFETY PRECAUTIONS - Important safety warnings
5. 🛠️ REQUIRED TOOLS - What tools are needed
6. 📦 RECOMMENDED PARTS - Parts that may need replacing

Be practical, clear, and professional. Always prioritize safety.`;

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          max_tokens: 1024,
        }),
      }
    );

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || JSON.stringify(data);

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ answer: "Error connecting to AI. Please try again." }, { status: 500 });
  }
}