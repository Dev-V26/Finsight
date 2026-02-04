import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
