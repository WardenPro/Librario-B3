import cron from "node-cron";
import "./expired_reservation";
import { expired_reservation } from "./expired_reservation";
import { logMessage } from "./log";

export function startScheduler() {
    cron.schedule("0 * * * *", async () => {
        console.log("Exécution de la tâche 'expired_reservation' :", new Date().toISOString());
        await expired_reservation();
    });
    logMessage("Le scheduler est démarré !");
}