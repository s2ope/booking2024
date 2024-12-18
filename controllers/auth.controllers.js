import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Register function
export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
      verified: false, // Ensure this field is added
    });

    await newUser.save();

    // Generate email verification token
    const verificationToken = jsonwebtoken.sign(
      { email: newUser.email },
      process.env.JWT,
      { expiresIn: "1h" }
    );

    // Nodemailer transporter configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: newUser.email,
      subject: "Email Verification",
      text: `Please verify your email by clicking on the following link: 
      http://localhost:8800/api/auth/verify-email?token=${verificationToken}`,
    };

    // Send verification email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending email. Please try again later." });
      }
      console.log("Verification email sent successfully:", info.response);
      res
        .status(200)
        .send(
          "User has been created. Please check your email to verify your account."
        );
    });
  } catch (err) {
    next(err);
  }
};

// Email verification function
export const verifyEmail = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT);
    console.log("Decoded token:", decoded); // Log the decoded token

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      console.error("Invalid token or user does not exist.");
      return res.status(400).send("Invalid token or user does not exist.");
    }

    user.verified = true;
    await user.save();
    res.status(200).send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error("Error verifying email:", err); // Log the error
    next(err);
  }
};

// Login function
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong username or password!"));

    const token = jsonwebtoken.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ ...otherDetails });
  } catch (err) {
    next(err);
  }
};
