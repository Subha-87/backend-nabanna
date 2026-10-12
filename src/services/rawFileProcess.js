require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const path = require("path");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { embeddCompanyData } = require("./embeddingService");
const { storeContext } = require("./vectorPineconeService");

// Join parts of a path safely
//const fullPath = path.join("user", "documents", "file.txt");
const filePath = "../../public/CompanyFile/employee-handbook-template.pdf"; //static File// later implement dynamic path by posting//
const fileName = path.basename(filePath, ".pdf");
console.log("fileName:", fileName);

const fileIndexing = async () => {
  try {

    // Phase 1 : RAW FILE --> CHUNK FILE
    const loader = new PDFLoader(filePath, { splitPages: false });
    //console.log(loader);

    const doc = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });

    const documents = await splitter.splitDocuments(doc);
    //console.log("split chunk doc:", documents);
    const validDocs = documents.filter((d) => d.pageContent.trim().length > 0); //Filter Empty Chunks
    //console.log("Final documents:", validDocs.length);
    if (validDocs.length === 0) {
      console.log("❌ No documents to store");
      return;
    }
    const textsToEmbed = validDocs.map((d) => d.pageContent); ///Prepare Clean Documents Array for chunking. --fetch pagecontent
    //console.log("State of Chunks Before Embedding: ", textsToEmbed);
    console.log(`Embedding ${textsToEmbed.length} chunks...`);

    // Phase 2 ->CHUNK FILE--> NUMERIC VECTORS // Embedd The Chunk //
    const staticVector = await embeddCompanyData(textsToEmbed);// embedd model calling //

    //console.log("vector:",staticVector)

    // Phase 3 - >Store the NUMERIC Vector Index to Pinecone Vector Database //
    await storeContext(validDocs, staticVector, fileName, filePath);
  } catch (error) {
    console.error(error);
    return null;
  }
};

fileIndexing();

/*module.exports = {
  fileIndexing,
};*/
