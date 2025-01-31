import dotenv from "dotenv";

function getKeys() {
    let key;
    dotenv.config();

    try {
        key = process.env.SECRET_KEY;
    } catch (err) {
        throw new Error("Unable to read the secret:" + err);
    }
    if (!key) {
        throw new Error("Missing keys in secrets.");
    }
    return key;
}

const key = getKeys();
export default key;