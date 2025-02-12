import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';

export async function generateBarcodeImage(barcodeCopyId: number): Promise<string | null> {
    try {

        const barcodeText = String(barcodeCopyId);

        const pngBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: barcodeText,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
        });

        const fileName = `barcode_${barcodeText}.png`;
        const filePath = path.join(__dirname, fileName);

        fs.writeFileSync(filePath, pngBuffer);

        return filePath;
    } catch (error) {
        console.error("Erreur lors de la génération de l'image du code-barres :", error);
        return null;
    }
}