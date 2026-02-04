import "dotenv/config";

import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { initAgenda } from "./jobs/agenda.js";
import { defineJobs, scheduleJobs } from "./jobs/index.js";
import { startGoalReminderScheduler } from "./schedulers/goalReminder.scheduler.js";


const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  // ✅ Init agenda
  const agenda = await initAgenda(process.env.MONGODB_URI);

  // ✅ Define job processors first (no DB write)
  defineJobs(agenda);

  // ✅ Start agenda (connects DB + creates collection)
  await agenda.start();
  console.log("✅ Agenda started");

  // ✅ Only AFTER start: schedule recurring jobs (this writes to DB)
  await scheduleJobs(agenda);
  console.log("✅ Agenda jobs scheduled");

  // ✅ Start goal reminder scheduler (cron-based)
  try {
  startGoalReminderScheduler();
} catch (e) {
  console.error("⚠️ Goal scheduler failed to start, but server will continue:", e);
}




  const app = createApp();
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});


