import bwipjs from "bwip-js";
import { AppError } from "../utils/AppError";

export async function generateBarcodeImage(barcodeCopyId: number): Promise<string> {
    try {
        const barcodeText = String(barcodeCopyId);

        const pngBuffer = await bwipjs.toBuffer({
            bcid: "code128",
            text: barcodeText,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
        });

        return `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (error) {
        throw new AppError("Error generating the barcode image.", 500, error);
    }
}
