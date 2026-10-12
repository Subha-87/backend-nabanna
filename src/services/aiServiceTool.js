const { groq, tvly, LLMnodeCache } = require("../config/aiClient");
const { webBuildMessage, LLMinputMsg } = require("../utils/promptBuilder");
const { itContent } = require("../utils/promptContent");
const {runAgentLoop,agentLoop} = require("./loopService")
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
    console.log("WebToolAnswer:", finalSearchResult);

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
// MAIN FUNCTION NORMAL(1) //
const getChatResponse = async (userMessage) => {
  console.log(userMessage)
  const message = webBuildMessage(userMessage); // message coming from prompt building section //

  const RintuMsg = message;
  try {
    const response = await groq.chat.completions.create({
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the internet for latest news, sports results, events, facts, or any information the model does not know",
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
      ],
      tool_choice: "auto",
      messages: RintuMsg,
      model: "llama-3.3-70b-versatile", // -->Use of Basic Model //
      temperature: 0,
    });
    /* Main LLM Response Generate HERE */
    //console.log("LLM 1st Reponse:", response.choices[0].message); //(content || tool_calls)  check answer pattern

    RintuMsg.push(response.choices[0].message); // 1st when user query 1st llm assist to do webserach response via tool //

    // console.log(JSON.stringify(response.choices[0].message, null, 2)); answer pattern when tool used structed output //
    const toolCalls = response.choices[0].message.tool_calls;
    /* When NO Tool Call Required */
    if (!toolCalls) {
      // if LLM has not used tool calls then LLM return final answer //
      return {
        success: true,
        message: response.choices[0].message?.content || "Cant Reply",
      };
    }
    // Code Logic For Tool Calls when Tools Detected //
    console.log("✅ Tool call detected!");
    /* TOOL FUNCTION LOGIC */
    for (const tool of toolCalls) {
      //console.log("toolStructure:", tool); // SEE:HOW IS TOOL STRUCTURE //
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName === "webSearch") {
        try {
          const toolResult = await webSearch(JSON.parse(functionParams)); // function calling with sending params to the function as parameter //
          //console.log("Web Search Result:",toolResult);
          RintuMsg.push({
            role: "tool",
            tool_call_id: tool.id,
            content: toolResult.message,
            name: functionName,
          });

          const completions2 = await groq.chat.completions.create({
            messages: RintuMsg,
            model: "llama-3.3-70b-versatile", // -->Use of Basic Model //
            temperature: 0,
          });
          console.log(
            "LLM 2nd Response:",
            JSON.stringify(completions2.choices[0].message, null, 2),
          );
          // MAKE 2nd response destructure here //
          return {
            success: true,
            message: completions2.choices[0].message.content, // -> this ans is rendered on UI//
          };
        } catch (error) {
          console.error(error.error.error.message);
          return {
            success: false,
            message: "Somthing Went Wrong",
          };
        }
      }
    }
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

// MAIN FUNCTION ,WHILE LOOP USED(2) //
const getChatSuperResponse = async (userMessage) => {
  // getting userquery and pass to promt bulding function //
  const message = webBuildMessage(userMessage); // message coming from prompt building section //

  const RintuMsg = message;

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

  try {
    const MAX_ITERATION = 10;
    let iteration = 0;
    while (iteration < MAX_ITERATION) {
      iteration++;
      const response = await groq.chat.completions.create({
        tools: tools,
        tool_choice: "auto",
        messages: RintuMsg,
        model: "llama-3.3-70b-versatile", // -->Use of Basic Model //
        temperature: 0,
      });
      /* Main LLM Response Generate HERE */
      //console.log("LLM  Reponse:", response.choices[0].message); //(content || tool_calls)  check answer pattern

      RintuMsg.push(response.choices[0].message); // 1st when user query 1st llm assist to do webserach response via tool //

      // console.log(JSON.stringify(response.choices[0].message, null, 2)); answer pattern when tool used structed output //
      const toolCalls = response.choices[0].message.tool_calls;
      /* When NO Tool Call Required */
      if (!toolCalls) {
        // if LLM message content does not has tool calls then LLM return final answer //
        return {
          success: true,
          message: response.choices[0].message?.content || "Cant Reply",
        };
      }
      // Code Logic For Tool Calls when Tools Detected //
      console.log("✅ Tool call detected!");
      /* ✅ TOOL FUNCTION LOGIC */
      for (const tool of toolCalls) {
        // run tool and push result
        //console.log("toolStructure:", tool); // SEE:HOW IS TOOL STRUCTURE //
        const functionName = tool.function.name;
        const functionParams = tool.function.arguments;
        let args;
        try {
          args = JSON.parse(functionParams);
        } catch (error) {
          console.warn("Invalid JSON args:", functionParams);
          continue;
        }

        const toolFunction = toolRegistry[functionName];

        if (!toolFunction) {
          console.warn(`Unknown tool: ${functionName}`);
          constinue;
        }
        if (!args.query) {
          console.warn("Missing query param");
          continue;
        }
        //if (functionName === "webSearch") {
        try {
          const toolResult = await toolFunction(args); // function calling with sending params to the function as parameter //
          //console.log("Web Search Result:",toolResult);
          RintuMsg.push({
            role: "tool",
            tool_call_id: tool.id,
            content: toolResult.message, // string only
            name: functionName,
          });
        } catch (error) {
          console.error("Tool execution error:", error?.message || error);
          RintuMsg.push({
            role: "tool",
            tool_call_id: tool.id,
            content: "Tool execution failed",
          });
          continue;
          //}
        }
      }
    }
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

// Implemented New Function With LLM Memory(3)this is live //
const getChatRespMemory = async (userMessage, sessionId) => {
  try {
    const baseMessage = webBuildMessage(userMessage); // message coming from prompt building section //;
    const RintuMsg = LLMnodeCache.get(sessionId) ?? baseMessage;
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
    RintuMsg.push({
      role: "user",
      content: userMessage,
    });

    // Run Agent Loop Function //
    const result = await runAgentLoop(RintuMsg, tools, toolRegistry, sessionId);
    //console.log("\nAI Final Answer:", result);
    return result;
  } catch (error) {
    console.error("LLM ERROR:", error);
    //throw error;
    return {
      success: false,
      message:
        error?.error?.error?.message ||
        "AI Service Unavailable,Something is Wrong//LLM Error",
    };
  }
};

// Implemented RAG Based Chat Response //
const getChatRespRag = async (userMessage, sessionId) => {
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
    const message = LLMinputMsg({
      userQuery: userMessage,
      ragContext,
      memory,
    });
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

    LLMnodeCache.set(sessionId, memory);
  } catch (error) {
    console.error("LLM ERROR:", error);
    //throw error;
    return {
      success: false,
      message:
        error?.error?.error?.message ||
        "AI Service Unavailable,Something is Wrong//LLM Error",
    };
  }
};



module.exports = {
  getChatResponse,
  getChatSuperResponse,
  getChatRespMemory,
  getChatRespRag
};
