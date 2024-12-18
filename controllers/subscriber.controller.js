// controllers/subscribeController.js
import Subscriber from "../models/Subscriber.js";
import nodemailer from "nodemailer";

const subscribe = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Create a new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send confirmation email using Nodemailer
    const transporter = nodemailer.createTransport({
      // Configure your email provider here
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Subscription Confirmation",
      text: "Thank you for subscribing to our newsletter!",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Respond with success message
    res.status(200).json({ message: `Subscribed email: ${email}` });
  } catch (error) {
    console.error("Error subscribing:", error);
    res
      .status(500)
      .json({ error: "Error subscribing. Please try again later." });
  }
};

export default { subscribe };
