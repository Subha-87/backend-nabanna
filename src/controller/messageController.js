const dotenv = require("dotenv");

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const { sendSuccess, sendError } = require("../utils/apiResponse");

const postSMScomplain = async (req, resp) => {
  //console.log("..getting post request for sms");
  const { username, designation, room, type, complain, contact, domain } =
    req.body;

  //console.log("Complain Domain:", domain);

  const message = `Username : ${username}
Rank:${designation}
Room no :${room}
Complain:${type},${complain}
Contact:${contact}`;

  let numbers = [];

  if (domain === "Voice") {
    numbers = ["+919073362224"];
  } else if (domain === "Internet") {
    numbers = ["+919073362224"];
  } else if (domain === "PC_Hardware") {
    numbers = ["+919073362224"];
  } else if (domain === "Cable_TV") {
    numbers = ["+919073362224"];
  } else {
    return sendError(resp, 400, "Invalid Domain");
    //return res.status(400).json({ success: false, message: "Invalid domain" });
  }

  try {
    const responses = await Promise.all(
      numbers.map((num) =>
        client.messages.create({
          body: `IT Division Complain:${message}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: num,
        }),
      ),
    );
    //console.log(responses);

    resp.json({
      success: true,
      message: "SMS sent successfully",
      sids: responses.map((r) => r.sid),
    });
  } catch (error) {
    return sendError(resp, 500, "Server Error", error.message);
    //res.status(500).json({ success: false, error: error.message });
  }
};

// POST WHATS APP MESSAGE //
const postWhatsAppMsg = async (req, resp) => {
    //console.log("..getting post request for whatsapp")
  const { username, designation, room, type, complain, contact, domain } =
    req.body;
  //console.log("whatsapp sms:",domain)

const message = `Username : ${username}\nRank:${designation}\nRoom no :${room}\nComplain:${type},${complain}\nContact:${contact}`;

  const netNumber = ["+919073362224"];
  const voiceNumber = ["+919073362224"];
  const pcNumber = ["+919073362224"];
  const cableTvNo = ["+919073362224"];

  const selectTeamNumbers =
    domain === "Voice"
      ? voiceNumber
      : domain === "Internet"
        ? netNumber
        : domain === "PC_Hardware"
          ? pcNumber
          : cableTvNo;

  try {
    const results = [];

    for (const number of selectTeamNumbers) {
      const msg = await client.messages.create({
        from: 'whatsapp:+14155238886', // sandbox number
        to: `whatsapp:${number}`,
        body: `IT Division Complain:${message}`,
      });

      //console.log({wpResult:msg})

      results.push({
        to: number,
        sid: msg.sid,
        status: "sent",
      });
    }
    return sendSuccess(resp, 200, "Whatsapp send Successfully");
    /*res.json({
      success: true,
      message: "Whatsapp send Successfully",
      data: results,
    });*/
  } catch (error) {
    return sendError(resp, 500, "Internal Server Error");
  }
};

module.exports = {
  postSMScomplain,
  postWhatsAppMsg,
};

/* 
// Complain SEND TO Mobile Message By Twilo ://
/*it_app.post("/send-sms", async (req, res) => {
  const { username, designation, room, type, complain, contact, domain } =
    req.body;
  const message = `Username : ${username}\nRank:${designation}\nRoom no :${room}\nComplain:${type},${complain}\nContact:${contact}`;
  const numbers =
    domain === "Voice"
      ? ["+91 98365 31975"]
      : domain === "Internet"
        ? ["+91 62917 07545"]
        : domain === "PC_Hardware"
          ? ["+918910543996", "+919831126807"]
          : ["+91 84202 46095"];
  
  try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: setMobile_No,
    });
    const smsResponses = await Promise.all(
      numbers.map((num) =>
        client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: num,
        }),
      ),
    );

    res.json({
      success: true,
      sids: smsResponses.map((sms) => sms.sid),
      message: "SMS send Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});*/

// Message Routes //
//it_app.use("/publicMsg",messageRoutes)

// NEW MESSAGE  CODE SEND MOBILE MESSAGE BY TWILO //
/*it_app.post("/send-sms", async (req, res) => {
  const { username, designation, room, type, complain, contact, domain } =
    req.body;

  const message = `Username : ${username}
Rank:${designation}
Room no :${room}
Complain:${type},${complain}
Contact:${contact}`;

  let numbers = [];

  if (domain === "Voice") {
    numbers = ["+919073362224"];
  } else if (domain === "Internet") {
    numbers = ["+91907336224"];
  } else if (domain === "PC_Hardware") {
    numbers = ["+918910543996", "+919831126807"];
  } else if (domain === "Cable_TV") {
    numbers = ["+918420246095"];
  } else {
    return res.status(400).json({ success: false, message: "Invalid domain" });
  }

  try {
    const responses = await Promise.all(
      numbers.map((num) =>
        client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: num,
        }),
      ),
    );

    res.json({
      success: true,
      message: "SMS sent successfully",
      sids: responses.map((r) => r.sid),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//Complain send to Whatsapp //
it_app.post("/send-whatsapp", async (req, res) => {
  console.log(req.body);
  const { username, designation, room, type, complain, contact, domain } =
    req.body;
  const message = `Username : ${username}\nRank:${designation}\nRoom no :${room}\nComplain:${type},${complain}\nContact:${contact}`;

  const netNumber = [
    "+916291707545",
    "+919564181829",
    "+918240379986",
    "+919804647078",
  ];
  const voiceNumber = ["+919836531975"];
  const pcNumber = ["+918910543996", "+919831126807"];
  const cableTvNo = ["+918420246095"];

  const selectTeamNumbers =
    domain === "Voice"
      ? voiceNumber
      : domain === "Internet"
        ? netNumber
        : domain === "PC_Hardware"
          ? pcNumber
          : cableTvNo;

  try {
    const results = [];

    for (const number of selectTeamNumbers) {
      const msg = await client.messages.create({
        from: "whatsapp:+14155238886", // sandbox number
        to: `whatsapp:${number}`,
        body: message,
      });

      results.push({
        to: number,
        sid: msg.sid,
        status: "sent",
      });
    }

    res.json({
      success: true,
      message: "Whatsapp send Successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

*/
