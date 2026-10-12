const dotenv = require("dotenv");

dotenv.config();

const Groq = require("groq-sdk");
const {tavily} = require("@tavily/core")
const NodeCache = require("node-cache")

 const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
 const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
 const LLMnodeCache = new NodeCache({stdTTL:60*60*24})

 module.exports = {
    groq,tvly,LLMnodeCache
 }
