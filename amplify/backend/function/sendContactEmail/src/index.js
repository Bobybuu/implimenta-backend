// amplify/backend/function/sendContactEmail/src/index.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  try {
    // 1. Send to internal team
    const emailResponse = await resend.emails.send({
      from: "Contact Form <sales@implimenta.tech>",
      to: ["sales@implimenta.tech"],
      subject: `New Contact from ${body.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        ${body.company ? `<p><strong>Company:</strong> ${body.company}</p>` : ""}
        ${body.service ? `<p><strong>Service:</strong> ${body.service}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${body.message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // 2. Confirmation to user
    const confirmationResponse = await resend.emails.send({
      from: "Implimenta <sales@implimenta.tech>",
      to: [body.email],
      subject: "Thanks for contacting us!",
      html: `
        <p>Hi ${body.name},</p>
        <p>Thanks for reaching out! We've received your message and will get back soon.</p>
        <blockquote>${body.message.replace(/\n/g, "<br>")}</blockquote>
        <p> The Implimenta Team</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Emails sent!",
        emailId: emailResponse.data?.id,
        confirmationId: confirmationResponse.data?.id,
      }),
    };
  } catch (error) {
    console.error("Error sending emails:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

