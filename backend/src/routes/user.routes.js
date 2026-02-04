import { Router } from "express";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", auth, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
