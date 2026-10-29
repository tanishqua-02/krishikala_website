import express from "express";
import { chat } from "../controllers/chatController.js";

const router = express.Router();

// Public — chatbot accessible without login so visitors can ask questions
router.post("/", chat);

export default router;
