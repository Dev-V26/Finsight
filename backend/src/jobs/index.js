import { defineBudgetAlertsJob } from "./budgetAlerts.job.js";

// 1) Define jobs (no DB writes here)
export function defineJobs(agenda) {
  defineBudgetAlertsJob(agenda);
}

// 2) Schedule jobs (DB write happens here -> must run AFTER agenda.start())
export async function scheduleJobs(agenda) {
  // For testing you can set "1 minute", later change back to "1 hour"
  await agenda.every("1 minute", "budget-alerts");
}
