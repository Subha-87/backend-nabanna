require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const path = require("path");
const { groq, tvly, LLMnodeCache } = require("../config/aiClient");
const {LLMinputMsg } = require("../utils/promptBuilder");
const { itContent } = require("../utils/promptContent");
const {agentLoop} = require("./loopService")
const{retrieveContext} = require("./vectorPineconeService")

// Web Search Tool Calling //
async function webSearch({ query }) {
  //console.log("Calling Web Search..");
  // Here we will do tavilly call
  //console.log("LLM SEND QUESTION TO TOOL:-",query)
  try {
    const tvlyResp = await tvly.search(query, {
      maxResults: 4,
    });
    //console.log("Web Search RAW response:",tvlyResp) // Multiple Response Results in the form of Array //

    //const finalSearchResult = tvlyResp.results.map(result=>result.content) // filter the content from results //
    const finalSearchResult = tvlyResp.results
      .map((result) => result.content)
      .join("\n\n"); // making string with space and new line //
    //console.log("WebToolAnswer:", finalSearchResult);

    return {
      success: true,
      message: finalSearchResult || "Something..", // currently direct return  web search response in array and sent back to LLM
    };
  } catch (error) {
    //console.error(error);
    return {
      success: false,
      message: "Tvly Query Not Resolved", // Error send back to LLM
    };
  }
}


const getChatRespRag = async (userMessage,sessionId) => {
  try {
    const tools = [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the internet",
          parameters: {
            // JSON Schema object
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The Search query to perform search on",
              },
            },
            required: ["query"],
          },
        },
      },
    ];
    const toolRegistry = {
      // every possible tool functions will be mention here//
      webSearch,
    };
    // 1. Load Memory
    const memory = LLMnodeCache.get(sessionId) ?? [];
    // 2. Get Rag Context
    const ragContext = await retrieveContext(userMessage); //1) send user query --> vector pinecone search //

    //3.Build fresh prompt
    const message = await LLMinputMsg({
      userQuery: userMessage,
      ragContext,
      memory,
    });
    console.log("msg:",message)
    //4.Run Agent//
    const result = await agentLoop(message, tools, toolRegistry);
    //saveclean memory only //
    memory.push({
      role: "user",
      content: userMessage,
    });
    memory.push({
      role: "assistant",
      content: result,
    });
    console.log("AI Answer:",result)
    LLMnodeCache.set(sessionId, memory);
  } catch (error) {
    console.error("LLM ERROR:", error);
    //throw error;
    /*return {
      success: false,
      message:
        error?.error?.error?.message ||
        "AI Service Unavailable,Something is Wrong//LLM Error",
    };*/
  }
};

getChatRespRag("what should be my overtime pay?","r5467")
