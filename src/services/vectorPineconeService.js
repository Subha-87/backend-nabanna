const dotenv = require("dotenv");
const { Pinecone: PineconeClient } = require("@pinecone-database/pinecone");
const { embeddUserQuery, embeddCompanyData } = require("./embeddingService");

dotenv.config();

// Pinecone //
/*const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});*/
const pinecone = new PineconeClient();
const pinecondeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Search User Query Vector in Pinecone //
const retrieveContext = async (userQuery) => {
  console.log("Context Retrieval Function Processing..")
  try {
    const vectorIndex = await embeddUserQuery(userQuery); //2. get user query string format and send to embedd model //
    // Pass vector to pineconde database for semantic search //
    const searchResult = await pinecondeIndex.query({
      // pass the query vector index to pinecone semantic search//
      vector: vectorIndex, //Numeric data//
      topK: 3,
      includeMetadata: true,
    });

    const context = searchResult.matches
      .map((chunk) => chunk.metadata.text)
      .join("\n\n");
    return context; // return matching relevant chunk text (string)
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Prepare Static Company Data to Store in Pinecone Vector Database //

const storeContext = async (validDoc,chunkVector,fileName,filepath) => {
  console.log("pinecone store function starting...")
  try {
    const pineConeVectors = validDoc.map((doc, i) => ({
      id:`${fileName}_chunk_${i}`,//`doc_${Date.now()}_${i}`,
      values: chunkVector[i],
      metadata: {
        text: doc.pageContent,
        source: doc.metadata?.source || filepath,
        category: "policy",
        uploadAt: Date.now(),
      },
    }));

    const indexDescription = await pinecone.describeIndex(
      process.env.PINECONE_INDEX_NAME,
    );

    const hostUrl = indexDescription.host;

    const response = await fetch(`https://${hostUrl}/vectors/upsert`, {
      method: "POST",
      headers: {
        "Api-Key": process.env.PINECONE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vectors: pineConeVectors }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json(); //Store Vectors in Pinecone Database
    console.log("✅ Stored successfully! Pinecone response:", result);
    //implement later this response show to UI when user upload file //
  } catch (error) {
    console.error("Load Error:", error);
  }
};

module.exports = {
  retrieveContext,
  storeContext,
};
