// api/generate.js
// Runs on Vercel's server, NOT in the browser — so the API key is never exposed.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        error: data.error?.message || "Gemini API error",
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return res.status(502).json({ error: "Empty response from Gemini" });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "Server error generating line" });
  }
}
