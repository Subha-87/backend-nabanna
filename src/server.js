const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/database");
const it_app = require("./app");

//const isDev = process.env.NODE_ENV !== "production";
//const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.BACKEND_PORT || 5000;
//const HOST = isDev ? "localhost" : "127.0.0.1"; // this change to NGINX IP

const startServer = async () => {
  // Connect DataBase//
  try {
    connectDB();
    it_app.listen(PORT, "127.0.0.1", () => {
      console.log(`Backend running on → http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error);
    process.exit(1);
  }
};

startServer();
