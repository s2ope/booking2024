import express from "express";
import {
  register,
  login,
  verifyEmail,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);

export default router;
