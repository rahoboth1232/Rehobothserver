require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rehobothdigitechsolution.com"
  ],
}));

// Mail function
async function sendMail({ name, email, message }) {
  console.log("Sending email via Resend...");

  await resend.emails.send({
    from: "Contact <onboarding@resend.dev>",
    to: [process.env.EMAIL_USER],
    replyTo: email,
    subject: "New Contact Form Message",
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  console.log("Email sent successfully");
}

// Route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await sendMail({ name, email, message });
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
