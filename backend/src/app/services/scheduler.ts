import cron from "node-cron";
import "./expired_reservation";
import { expired_reservation } from "./expired_reservation";
import { logMessage } from "./log";

export function startScheduler() {
    cron.schedule("0 * * * *", async () => {
        logMessage("Executing the 'expired_reservation' task.");
        await expired_reservation();
    });
    logMessage("The scheduler is started!");
}
