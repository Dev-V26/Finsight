import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import healthRoutes from "./routes/health.routes.js";

import transactionRoutes from "./routes/transaction.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import anomalyRoutes from "./routes/anomaly.routes.js";
import reportRoutes from "./routes/reports.routes.js";




import devGoalReminderRoutes from "./routes/devGoalReminder.routes.js";
import devGoalRoutes from "./routes/devGoal.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { notFound } from "./middleware/notFound.middleware.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // ✅ SUPER RELIABLE CORS (fixes OPTIONS preflight 100%)
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    }

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Routes
  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api", userRoutes);

  app.use("/api/settings", settingsRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use("/api/transactions", transactionRoutes);
  app.use("/api/budgets", budgetRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/insights", insightsRoutes);
  app.use("/api/anomalies", anomalyRoutes);
  app.use("/api/reports", reportRoutes);
  
  // ✅ NEW: Portfolio module
  app.use("/api/portfolio", portfolioRoutes);

  // ✅ kept dev helpers
  app.use("/api/dev-goal-reminders", devGoalReminderRoutes);
  app.use("/api/dev-goals", devGoalRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
