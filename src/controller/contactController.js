
const nodemailer = require("nodemailer");

const OFFICE_EMAILS = Object.freeze({
  se: {
    name: "S.E. — IT Circle, KIT Building",
    email: "seitpwd@wb.gov.in",
  },
  ee: {
    name: "E.E.",
    email: "eeitpwd@wb.gov.in",
  },
  ae: {
    name: "A.E.",
    email: "ae2itpwd@gmail.com",
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

// Run SMTP verification once when the controller module loads.
transporter
  .verify()
  .then(() => {
    console.log("SMTP connection verified successfully.");
  })
  .catch((error) => {
    console.error("SMTP verification failed:", error.message);
  });

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const contactForm = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      subject,
      office,
      message,
    } = req.body || {};

    // Validate field types and required values.
    const fields = {
      fullName,
      email,
      phone,
      subject,
      message,
    };

    for (const [field, value] of Object.entries(fields)) {
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `Please provide a valid ${field}.`,
        });
      }
    }

    // Select recipient from the trusted server-side mapping.
    if (typeof office !== "string" || !OFFICE_EMAILS[office]) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid office.",
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const selectedOffice = OFFICE_EMAILS[office];

    // Length limits.
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanPhone.length > 20 ||
      cleanSubject.length > 100 ||
      cleanMessage.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    // Basic email and phone validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[0-9()\s-]{7,20}$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!phonePattern.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    // Prevent unexpected control characters in email headers.
    if (/[\r\n]/.test(cleanSubject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject.",
      });
    }

    const safe = {
      name: escapeHtml(cleanName),
      email: escapeHtml(cleanEmail),
      phone: escapeHtml(cleanPhone),
      subject: escapeHtml(cleanSubject),
      office: escapeHtml(selectedOffice.name),
      message: escapeHtml(cleanMessage).replace(/\r?\n/g, "<br>"),
    };

    const mailOptions = {
      from: {
        name: "PWD IT Circle Contact Form",
        address: process.env.SMTP_USER,
      },
      to: selectedOffice.email,
      replyTo: cleanEmail,
      subject: `Contact Form: ${cleanSubject}`,
      text: [
        "New Contact Form Submission",
        "",
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${cleanPhone}`,
        `Subject: ${cleanSubject}`,
        `Selected Office: ${selectedOffice.name}`,
        `Office Email: ${selectedOffice.email}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;color:#243247;">
          <div style="background:#1a3a5c;color:#fff;padding:22px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;">PWD IT Circle</h2>
            <p style="margin:8px 0 0;">New Contact Form Submission</p>
          </div>

          <div style="padding:24px;border:1px solid #dbe3ed;">
            <p><strong>Name:</strong> ${safe.name}</p>
            <p><strong>Email:</strong> ${safe.email}</p>
            <p><strong>Phone:</strong> ${safe.phone}</p>
            <p><strong>Subject:</strong> ${safe.subject}</p>
            

            <hr style="border:0;border-top:1px solid #dbe3ed;margin:20px 0;" />

            <h3>Message</h3>
            <p style="line-height:1.7;overflow-wrap:anywhere;">${safe.message}</p>
          </div>

          <p style="font-size:12px;color:#64748b;margin-top:12px;">
            This message was submitted through the PWD IT Circle website contact form.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log delivery diagnostics without logging the visitor's personal data.
    console.log("Contact email submitted to SMTP:", {
      messageId: info.messageId,
      recipient: selectedOffice.email,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    if (
      info.rejected?.some(
        (address) =>
          address.toLowerCase() === selectedOffice.email.toLowerCase()
      ) ||
      !info.accepted?.some(
        (address) =>
          address.toLowerCase() === selectedOffice.email.toLowerCase()
      )
    ) {
      return res.status(502).json({
        success: false,
        message: "The email server did not accept the selected recipient.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been submitted successfully.",
    });
  } catch (error) {
    // Avoid logging request bodies or SMTP credentials.
    console.error("Contact form email error:", {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to send your message right now. Please try again later.",
    });
  }
};

module.exports = {
  contactForm,
};