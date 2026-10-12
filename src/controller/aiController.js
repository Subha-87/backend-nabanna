const {getBasicResponse,chatServiceOpenAI,chatGeminiAI} = require('../services/aiService')
const {
  getChatResponse,
  getChatSuperResponse,
  getChatRespMemory,
  getChatRespRag
  
} = require("../services/aiServiceTool");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const askAI = async (req, resp) => {
  console.log(req.body)
  try {
    const { query,threadId } = req.body; // extract user query or questions with id//
    const response = await chatGeminiAI(query,threadId); // Integrated AI Function calling passing user query //

    return sendSuccess(resp, 200, response.message);
  } catch (error) {
    console.error(error)
    sendError(resp, 500, error.message);
  }
};

module.exports = askAI;
