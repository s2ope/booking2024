import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// MongoDB connection
const MONGO_URI = process.env.MONGO;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);

// Mongoose schema for storing emails
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Email = mongoose.model("Email", emailSchema);

// Function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Subscribe route
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Check if email already exists in the database
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    // Save email to MongoDB
    const newEmail = new Email({ email });
    await newEmail.save();

    // Nodemailer transporter configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Resolve file path for attachment
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const attachmentPath = path.join(__dirname, "sample.jpg");

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Subscription Confirmation",
      text: "Thank you for subscribing to our newsletter!",
      html: "<b>Feel free to contact us</b>",
      attachments: [
        {
          filename: "sample.jpg",
          path: attachmentPath,
          contentType: "image/jpg",
        },
      ],
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending email. Please try again later." });
      }
      console.log("Email sent successfully:", info.response);
      res.status(200).json({ message: `Subscribed email: ${email}` });
    });
  } catch (error) {
    console.error("Error subscribing:", error);
    res
      .status(500)
      .json({ error: "Error subscribing. Please try again later." });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
