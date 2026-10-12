const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");
const { groq } = require("../config/aiClient");
const { simpleBuildMessage } = require("../utils/promptBuilder");
const { Parts } = require("openai/resources/uploads/parts.js");

const client = new OpenAI();
// 2. Initialize the client (automatically uses process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

const getBasicResponse = async (userMessage) => {
  console.log("BASIC TEST:", userMessage);
  const messages = simpleBuildMessage(userMessage);
  try {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile", // -->Use of Basic Model //
      temperature: 0,
    });
    return {
      success: true,
      message: response.choices[0].message.content,
    };
  } catch (error) {
    //console.error("Full Error:", error);
    return {
      success: false,
      message:
        error?.error?.error?.message ||
        "AI Service Unavailable,Something is Wrong",
    };
  }
};

const chatServiceOpenAI = async (userMsg) => {
  const messages = simpleBuildMessage(userMsg);
  try {
    const response = await client.responses.create({
      model: "gpt-6-astra",

      input: messages,
    });
    console.log(response);
    return {
      success: true,
      message: response.output_text,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "something wrong",
    };
  }
};

const chatGeminiAI = async (userMsg) => {
  const messages = simpleBuildMessage(userMsg);
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: userMsg
    });
    console.log(interaction.output_text);
    return {success:true,message:interaction.output_text}
  } catch (error) {
    throw new Error(error)
  }
};

module.exports = {
  getBasicResponse,
  chatServiceOpenAI,
  chatGeminiAI
};
