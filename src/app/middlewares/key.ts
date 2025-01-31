import fs from "fs";
import dotenv from "dotenv";

function getKeys() {
    let rsa;

    try {
        if (process.env.IS_PRODUCTION === "true") {
            rsa = fs.readFileSync("/run/secrets/rsa_secret", "utf8").trim();
        } else {
            dotenv.config();
            rsa = process.env.SECRET_KEY;
        }
        if (!rsa) {
            throw new Error("Clés manquantes dans dans les secrets");
        }
        return { rsa };
    } catch (err) {
        throw new Error("Impossible de lire le secret : " + err);
    }
}

const keys = getKeys();
export default keys;