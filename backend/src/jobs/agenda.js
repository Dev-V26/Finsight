import Agenda from "agenda";

let agendaInstance = null;

export function getAgenda() {
  if (!agendaInstance) throw new Error("Agenda not initialized");
  return agendaInstance;
}

export async function initAgenda(mongoUri) {
  if (!mongoUri) throw new Error("MONGODB_URI missing for Agenda");

  const agenda = new Agenda({
    db: { address: mongoUri, collection: "agendaJobs" },
    processEvery: "30 seconds",
  });

  agendaInstance = agenda;
  return agendaInstance;
}
export function isAgendaReady() {
  return !!agendaInstance;
}
