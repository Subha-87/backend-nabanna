const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const twilio = require("twilio");
const path = require("path")

const itItemsRouter = require("./routes/itItemsRoute");

const itLetterRouter = require("./routes/itRequisitionRoute");

const netDataRouter = require("./routes/netRoute");

const voiceRouter = require("./routes/voiceRoute");

const complainRouter = require("./routes/complainRoute");
const estimateRouter = require("./routes/estimateRoute");

const hardwareRouter = require("./routes/hardwareRoute");

const aiRoutes = require("./routes/aiRoute");

const messageRoutes = require("./routes/complainMsgRoute");

const setTopBoxRoutes = require("./routes/boxRoute");

const cablelTvRoutes = require("./routes/catvRoute");

const meetingRoutes = require("./routes/meetingRoute");

const pageContactRoutes = require("./routes/contactRoute")
const it_app = express();

it_app.use(helmet());

//Body parsing middleware//
it_app.use(express.json({ limit: "100mb" }));

const isDev = process.env.NODE_ENV !== "production";
const isProd = process.env.NODE_ENV === "production";
// Trust proxy only in PROD (NGINX)
/*if (!isDev) {
  it_app.set("trust proxy", 1);
}

// CORS only for DEV
if (isDev) {
  it_app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  );
}*/

const allowedOrigins = [
  process.env.CORS_ORIGIN_TWO,
  process.env.CORS_ORIGIN_ONE,
];

//app.use(cors(corsOption))
it_app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
//app.options('*', cors()); // Handle preflight requests

// Incoming Nabanna IT ITEMS Crud Management - GET/POST/PUT/DELETE //

it_app.use("/api/itemNabanna", itItemsRouter);

// Incoming Nabanna LETTER Crud Management - GET/POST/PUT/DELETE //

it_app.use("/api/ItReq", itLetterRouter);

// Task Assign for It user  ( Net Data)

it_app.use("/api/TaskData", netDataRouter);

// Voice Data Crud Management(Handlers)
it_app.use("/api/voiceTask", voiceRouter);

// User Comaplin Crud Managment //
it_app.use("/api/complain", complainRouter);

// Estimate Crud //
//it_app.use('/api/estimateReg',estimateRouter)
it_app.use("/api/estimateReg", estimateRouter);

it_app.use(
  "/api/ApprovalFolder",
  express.static(path.join(process.cwd(), "public", "ApprovalFolder")),
);
it_app.use(
  "/api/EstimateFolder",
  express.static(path.join(process.cwd(), "public", "EstimateFolder")),
);
it_app.use(
  "/api/RequisitionFolder",
  express.static(path.join(process.cwd(), "public", "RequisitionFolder")),
);
/*it_app.use(
  "/ChallanFolder",
  express.static(path.join(process.cwd(),'public', "ChallanFolder"),{
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000");
      // 🔥 THIS FIXES NotSameOrigin 200
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cache-Control", "no-store"); // 🚨 prevents 304
      
      
    },
  })
);*/

if (isProd) {
  it_app.use(
    "/api/ChallanFolder",
    express.static(path.join(process.cwd(), "public", "ChallanFolder"), {
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cache-Control", "public, max-age=31536000");
      },
    }),
  );
}

it_app.use(
  "/api/WorkOrderFolder",
  express.static(path.join(process.cwd(), "public", "WorkOrderFolder")),
);

it_app.use("/api/NabannaSystem", hardwareRouter);

it_app.use("/api/NabannaTV", cablelTvRoutes);

//** AI INCOMING QUERY *//
it_app.use("/api/AIagent/ai", aiRoutes);

// Message Routes (SMS & Whats-APP) //
it_app.use("/api/publicMsg", messageRoutes);

it_app.use("/api/nabanna", setTopBoxRoutes);

const meetingPath = path.join(
  process.cwd(),
  "uploads",
  "images",
  "Meetings"
);

it_app.use(
  "/api/uploads/images/Meetings",
  express.static(meetingPath)
);
it_app.use("/api/VIP", meetingRoutes);

it_app.use("/api/public",pageContactRoutes)

// TEST FOR BACKEND RUNNING OR NOT // TO TEST BACKEND  in Browser :http://127.0.0.1:5000
it_app.get("/api/", (req, res) => {
  res.json({
    status: "Backend is running,Test Success",
    server: "Nabanna Express API",
    port: 5000,
  });
});



module.exports = it_app;
