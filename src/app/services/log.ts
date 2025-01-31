import fs from "fs";
import path from "path";

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `[ ${year}-${month}-${day} ${hours}:${minutes}:${seconds} ]`;
}

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export function logMessage(message: string) {
    let log = `${getCurrentDateTime()}: ${message}`;
    console.log(log);
    log += "\n";
    fs.appendFileSync(path.join(logDir, "server.log"), log);
}

export function errorMessage(
    message: string,
    error: unknown = new Error("Aucune erreur spécifiée"),
) {
    let log = `${getCurrentDateTime()}: ${message}`;
    console.log(log);
    log += "\n";
    if (error instanceof Error && error.message != "Aucune erreur spécifiée") {
        console.error(error);
        log += `${error.stack}\n`;
    }
    fs.appendFileSync(path.join(logDir, "error.log"), log);
}