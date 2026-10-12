const {
  itContent,
  normalWebContent,
  itContentModify,
} = require("./promptContent");

const { basePersona, toolPolicy, ragInstruction } = require("./promptGroup");

const simpleBuildMessage = (userQuery) => {
  return [
    {
      content:
        "You are a Smart perosnal Assistant who answer to question and your answer will be short",
      role: "system",
    },
    {
      content: userQuery,
      role: "user",
    },
  ];
};

// Currently using this one //
const webBuildMessage = (userQuery) => {
  const contentPromptIt = itContentModify();
  return [
    {
      role: "system",
      content: contentPromptIt,
    },
    {
      content: userQuery,
      role: "user",
    },
  ];
};

// Modified Prompt Message for LLM //

const LLMinputMsg = async ({ userQuery, memory = [], ragContext = "" }) => {
  console.log(userQuery);
  console.log(ragContext);
  const ragPrompt = await ragInstruction(ragContext); // main rag answer thing //

  return [
    {
      role: "system",
      content: `
${basePersona}

${toolPolicy}

${ragPrompt}
`,
    },

    ...memory,

    {
      role: "user",
      content: userQuery,
    },
  ];
};

module.exports = {
  simpleBuildMessage,
  webBuildMessage,
  LLMinputMsg,
};
