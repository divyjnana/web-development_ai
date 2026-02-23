const express = require("express");
const cors = require("cors");
const { pipeline } = require("@xenova/transformers");

const app = express();
app.use(cors());
app.use(express.json());

let generator;

async function loadModel() {
  try {
    console.log("⏳ Loading TinyLlama Chat model...");

    generator = await pipeline(
      "text-generation",
      "Xenova/TinyLlama-1.1B-Chat-v1.0",
      {
        dtype: "q4" // quantized for lower RAM usage
      }
    );

    console.log("✅ TinyLlama model loaded successfully");
  } catch (err) {
    console.error("❌ Model failed to load:", err);
  }
}

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    if (!generator) {
      return res.status(500).json({
        success: false,
        error: "Model not loaded yet",
      });
    }

    console.log("Generating text with TinyLlama...");

    const formattedPrompt = `
<|system|>
You are a helpful AI assistant.
<|user|>
${prompt}
<|assistant|>
`;

    const output = await generator(formattedPrompt, {
      max_new_tokens: 200,
      temperature: 0.7,
      top_k: 40,
      top_p: 0.9,
      repetition_penalty: 1.2,
    });

    const fullText = output[0].generated_text;

    const answer = fullText.split("<|assistant|>").pop().trim();

    res.json({
      success: true,
      data: answer,
    });

  } catch (error) {
    console.error("❌ Model Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// app.listen(5000, async () => {
//   console.log("🚀 Server running at http://localhost:5000");
//   await loadModel();
// });

// const express = require("express");
// const cors = require("cors");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // 🔐 Put your API key here
// const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");

// // Choose model
// const model = genAI.getGenerativeModel({
//   model: "models/gemini-2.5-flash",
// });

// app.post("/generate", async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     if (!prompt) {
//       return res.status(400).json({
//         success: false,
//         error: "Prompt is required",
//       });
//     }

//     console.log("Generating text with Gemini...");

//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//       ],
//       generationConfig: {
//         temperature: 0.7,
//         topK: 40,
//         topP: 0.9,
//         maxOutputTokens: 200,
//       },
//     });

//     const response = result.response;
//     const text = response.text();

//     res.json({
//       success: true,
//       data: text,
//     });

//   } catch (error) {
//     console.error("❌ Gemini Error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// app.listen(5000, () => {
//   console.log("🚀 Server running at http://localhost:5000");
// });