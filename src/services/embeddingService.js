const dotenv = require("dotenv");

const { OpenAIEmbeddings } = require("@langchain/openai");

dotenv.config();

// Embedding model
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small", //$5 invest //
  apiKey: process.env.OPENAI_API_KEY,
});

// Embedd User Question to Vector Indexing //
const embeddUserQuery = async (userQ) => {
  console.log("query embedding function processing..")  
  try {
    const queryVector = await embeddings.embedQuery(userQ); // 3. get user query and process to embedd techninc by LLM
    return queryVector;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Embedd Static Company Paper/Knowledge to Vector Indexing //
const embeddCompanyData = async (chunkText) => {
// console.log("Embedding Function starting...")   
// console.log("KEY:", process.env.OPENAI_API_KEY);
  try {
    const staticVector = await embeddings.embedDocuments(chunkText);
    return staticVector;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  embeddUserQuery,
  embeddCompanyData,
};
