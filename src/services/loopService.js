const { groq, LLMnodeCache } = require("../config/aiClient");

const runAgentLoop = async (RintuMsg, tools, toolRegistry, threadId) => {
  //console.log("function called")
  const MAX_ITERATION = 10;
  let iteration = 0;

  while (iteration < MAX_ITERATION) {
    iteration++;

    const response = await groq.chat.completions.create({
      tools,
      tool_choice: "auto",
      messages: RintuMsg,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const message = response.choices[0].message; // LLM Generate -> response.choces[0].message.content || response.choces[0].message.tool_calls //
    
    //console.log(message)
    RintuMsg.push(message);

    const toolCalls = message.tool_calls;
    console.log(toolCalls)

    if (!toolCalls) {
      // While Loop Break Here //
      // Here we end the chatbot response //

      LLMnodeCache.set(threadId, RintuMsg); // set the user message in cache memory
      //console.log({ cacheData: LLMnodeCache }); // check what to store //
      //console.log(JSON.stringify(LLMnodeCache.data))
      return message.content || "Cant Reply";
    }

    for (const tool of toolCalls) {
      let args;

      try {
        args = JSON.parse(tool.function.arguments);
      } catch {
        continue;
      }

      const toolFunction = toolRegistry[tool.function.name];
      if (!toolFunction) continue;

      const toolResult = await toolFunction(args);

      RintuMsg.push({
        role: "tool",
        tool_call_id: tool.id,
        content: toolResult.message,
      });
    }
  }

  return "Agent stopped: too many tool calls";
};

const agentLoop = async (RintuMsg, tools, toolRegistry) => {
  const MAX_ITERATION = 10;
  let iteration = 0;

  while (iteration < MAX_ITERATION) {
    iteration++;

    const response = await groq.chat.completions.create({
      tools,
      tool_choice: "auto",
      messages: RintuMsg,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const message = response.choices[0].message; // LLM Generate -> response.choces[0].message.content || response.choces[0].message.tool_calls //

    RintuMsg.push(message);

    const toolCalls = message.tool_calls;

    if (!toolCalls) {
      // While Loop Break Here //
      // Here we end the chatbot response //

      return message.content || "Cant Reply";
    }

    for (const tool of toolCalls) {
      let args;

      try {
        args = JSON.parse(tool.function.arguments);
      } catch {
        continue;
      }

      const toolFunction = toolRegistry[tool.function.name];
      if (!toolFunction) continue;

      const toolResult = await toolFunction(args);

      RintuMsg.push({
        role: "tool",
        tool_call_id: tool.id,
        content: toolResult.message,
      });
    }
  }

  return "Agent stopped: too many tool calls";
};

module.exports = {
  runAgentLoop,
  agentLoop
};
