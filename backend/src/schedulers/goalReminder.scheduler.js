import cron from "node-cron";
import { runGoalDeadlineReminders } from "../utils/goalDeadlineReminders.js";

export function startGoalReminderScheduler() {
  // ✅ Production default: hourly (safer than once/day for deadline alerts)
  // ✅ Dev default: every 1 minute (easy to test)
  const isProd = process.env.NODE_ENV === "production";
  const schedule = process.env.GOAL_REMINDER_CRON || (isProd ? "0 * * * *" : "*/1 * * * *");

  // Run once on boot (after DB connection is established)
  setTimeout(async () => {
    try {
      console.log("⏰ Running Goal Deadline Reminders (startup)...");
      await runGoalDeadlineReminders();
      console.log("✅ Goal Deadline Reminders (startup) done.");
    } catch (err) {
      console.error("❌ Goal Deadline Reminders (startup) failed:", err?.message || err);
    }
  }, 3000);

  cron.schedule(schedule, async () => {
    try {
      console.log("⏰ Running Goal Deadline Reminders...");
      await runGoalDeadlineReminders();
      console.log("✅ Goal Deadline Reminders done.");
    } catch (err) {
      console.error("❌ Goal Reminder Scheduler failed:", err?.message || err);
    }
  });

  console.log(`✅ Goal Reminder Scheduler started (${schedule})`);
}
