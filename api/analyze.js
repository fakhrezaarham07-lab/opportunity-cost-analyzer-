export default async function handler(req, res) {
  const allowedOrigin =
    "https://fakhrezaarham07-lab.github.io";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { product, language } = req.body || {};

    if (!product || product.trim().length < 2) {
      return res.status(400).json({
        error: "Nama produk tidak boleh kosong."
      });
    }

    const languages = {
      id: "Bahasa Indonesia",
      en: "English",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
      ja: "日本語"
    };

    const selectedLanguage =
      languages[language] || "Bahasa Indonesia";

    const instructions = `
You are an AI assistant for an Opportunity Cost Analyzer.

Analyze the product based only on the product name provided by the user.

The answer must be written completely in ${selectedLanguage}.

Return ONLY valid JSON.

The JSON must contain exactly these fields:
- overview
- benefits
- risks
- opportunityCost
- value
- productInfo
- summary

Important:
- Do not invent exact current prices.
- Do not invent specifications if you are uncertain.
- If the product name is ambiguous, clearly state the assumption.
- Explain opportunity cost in a simple and understandable way.
- Be useful for ordinary consumers.
- Keep the answer concise but informative.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
          instructions,
          input: `Analyze this product: ${product}`,
          text: {
            format: {
              type: "json_schema",
              name: "product_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  overview: { type: "string" },
                  benefits: { type: "string" },
                  risks: { type: "string" },
                  opportunityCost: { type: "string" },
                  value: { type: "string" },
                  productInfo: { type: "string" },
                  summary: { type: "string" }
                },
                required: [
                  "overview",
                  "benefits",
                  "risks",
                  "opportunityCost",
                  "value",
                  "productInfo",
                  "summary"
                ],
                additionalProperties: false
              }
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error: "AI request failed."
      });
    }

    const outputText =
      data.output_text ||
      data.output
        ?.flatMap(item => item.content || [])
        ?.filter(item => item.type === "output_text")
        ?.map(item => item.text)
        ?.join("\n");

    if (!outputText) {
      return res.status(500).json({
        error: "AI tidak memberikan jawaban."
      });
    }

    const result = JSON.parse(outputText);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Terjadi kesalahan pada server."
    });
  }
}
