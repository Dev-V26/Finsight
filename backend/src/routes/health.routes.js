import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Health check",
    data: { status: "healthy", time: new Date().toISOString() },
  });
});

export default router;
