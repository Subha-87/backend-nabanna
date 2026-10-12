const adminSession = require("../models/adminSession");
const itPersonSession = require("../models/itPersonnelSession");
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization; //req.headers["x-session-id"];
    //console.log(authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized ! No Valid token" });
    }

    const s_id = authHeader.split(" ")[1];
    //console.log(s_id);

    /*let result = await adminSession.findOne({
      sessionId: s_id,
      expiry: { $gt: Date.now() },
    });
    if (!result) {
      result = await itPersonSession.findOne({
        sessionId: s_id,
        expiry: { $gt: Date.now() },
      });
    }*/
   // Run Parellal //
    const [adminSess, itSession] = await Promise.all([
      adminSession.findOne({ sessionId: s_id, expiry: { $gt: Date.now() } }),
      itPersonSession.findOne({ sessionId: s_id, expiry: { $gt: Date.now() } }),
    ]);

    const result = adminSess || itSession;

    if (!result) {
      return res
        .status(401)
        .json({ message: "Unauthorized Access ! No Valid Session Found" });
    }
    //console.log(result);
    req.session = result;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}

module.exports = verifyToken;
