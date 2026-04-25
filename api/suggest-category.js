module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { imageBase64 } = body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Du bist ein Assistent für eine Heimwerker-App.

Erkenne die Kategorie eines Gegenstands anhand eines Bildes.

Mögliche Kategorien:
Dübel, Schrauben, Bohrer, Werkzeug, Maschine, Elektrik, Unterlegscheiben, Nägel, Holzdübel, Beschläge, Große Box, Sortimentskasten

Antworte IMMER als JSON:
{
  "category": "...",
  "confidence": "...",
  "reason": "..."
}
`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Was ist auf diesem Bild?" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        category: "",
        confidence: "",
        reason: content,
      };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.log("API ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};
