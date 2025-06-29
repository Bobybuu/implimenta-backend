import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import { ContactFormData } from "./types";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY!);

app.post("/contact", async (req, res) => {
  const form = req.body as ContactFormData;
  try {
    await resend.emails.send({
      from: "Contact Form <sales@implimenta.tech>",
      to: ["sales@implimenta.tech"],
      subject: `New message from ${form.name}`,
      html: `<h2>${form.name} says:</h2><p>${form.message.replace(/\n/g, "<br>")}</p>`
    });
    await resend.emails.send({
      from: "Implimenta <sales@implimenta.tech>",
      to: [form.email],
      subject: "Thanks for reaching out!",
      html: `<p>Hi ${form.name}, thanks for your message!</p>`
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend running on port ${port}`));
