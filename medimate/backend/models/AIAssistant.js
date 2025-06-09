const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const fs = require("fs/promises");
const path = require("path");

class AIAssistant {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.systemPrompt =
      process.env.SYSTEM_PROMPT || "You are a helpful medical AI assistant.";
  }

  /**
   * Basic chat endpoint used by the front‑end conversational UI.
   * @param {string} message            – The latest user message
   * @param {Array<{role: string, content: string}>} history – Prior chat turns
   * @returns {Promise<string>}          – Assistant reply
   */
  async chat(message, history = []) {
    if (!message) throw new Error("Message is empty");

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    });

    return completion.choices[0].message.content;
  }

  /**
   * One‑shot document analysis (PDF / image / plain text).
   * The extracted text is summarized & medical advice is provided.
   */
  async analyzeFile(file) {
    if (!file) throw new Error("File not provided");

    const text = await this.#extractText(file);

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            `${this.systemPrompt} Summarize the user's medical document and provide advice.`,
        },
        { role: "user", content: text.slice(0, 15000) }, // guard token limit
      ],
    });

    return completion.choices[0].message.content;
  }

  // Internal helpers
  async #extractText(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const buffer = await fs.readFile(file.path);

    // PDF – use pdf‑parse
    if (ext === ".pdf") {
      const data = await pdfParse(buffer);
      return data.text;
    }

    // Images – OCR with tesseract.js
    if ([".png", ".jpg", ".jpeg", ".bmp", ".tiff"].includes(ext)) {
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(buffer);
      await worker.terminate();
      return text;
    }

    // Fallback: assume utf‑8 text file
    return buffer.toString("utf8");
  }
}

module.exports = AIAssistant;