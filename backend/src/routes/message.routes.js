import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsers, getMessages, sendMessage } from "../controller/message.controller.js";

const router = express.Router();

router.get("", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);

router.get("/send/:id", protectRoute, sendMessage);

export default router;