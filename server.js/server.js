import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 🚀 Ruta para la IA (OpenAI o DeepSeek)
app.post("/api/ia", async (req, res) => {
  const { topic, provider } = req.body;
  try {
    const model = provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini";
    const url =
      provider === "deepseek"
        ? "https://api.deepseek.com/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
    const key =
      provider === "deepseek"
        ? process.env.DEEPSEEK_KEY
        : process.env.OPENAI_KEY;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: `Explica ampliamente el tema: ${topic}. Incluye ejemplos y aplicaciones.`,
          },
        ],
      }),
    });
    const data = await r.json();
    res.json({ text: data.choices?.[0]?.message?.content || "Sin respuesta." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Error al conectar con la IA." });
  }
});

// 🚀 Ruta para YouTube
app.post("/api/youtube", async (req, res) => {
  const { topic } = req.body;
  const ytKey = process.env.YOUTUBE_KEY;
  try {
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        topic
      )}&maxResults=1&type=video&key=${ytKey}`
    );
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ items: [] });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor activo en http://localhost:${PORT}`));
