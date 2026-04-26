module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      rating,
      good,
      problems,
      nextFeature,
      comment,
    } = body || {};

    const emailText = `
WerkFuchs Feedback 🦊

Bewertung: ${rating || "-"}/5

👍 Gut:
${(good || []).join(", ") || "-"}

⚠️ Probleme:
${(problems || []).join(", ") || "-"}

🚀 Wunsch:
${nextFeature || "-"}

💬 Kommentar:
${comment || "-"}
`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "WerkFuchs <onboarding@resend.dev>",
        to: "Markus.Kettnacker.Prang@gmail.com",
        subject: `WerkFuchs Feedback (${rating || "-"}/5)`,
        text: emailText,
      }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.log("FEEDBACK ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};
