import bwipjs from 'bwip-js';
import { db } from "../config/database";
import { books } from "../../db/schema/book";
import { copy} from "../../db/schema/copy";
import { ConsoleLogWriter, eq } from "drizzle-orm";

export function convertISBN10toISBN13(isbn10: string): string {
  const cleaned = isbn10.replace(/[-\s]/g, '');
  if (cleaned.length !== 10) {
    throw new Error("L'ISBN-10 doit contenir 10 caractères.");
  }
  console.log("ISBN 1O en conversion pour ISBN 13....");
  const core = cleaned.substring(0, 9);
  const isbn13WithoutCheck = '978' + core;

  let sum = 0;
  for (let i = 0; i < isbn13WithoutCheck.length; i++) {
    const digit = parseInt(isbn13WithoutCheck[i], 10);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  
  const remainder = sum % 10;
  const checkDigit = (10 - remainder) % 10;
  
  return isbn13WithoutCheck + checkDigit.toString();
}

export async function hasValidISBN13(ISBN13: string | null): Promise<boolean> {
  try {
    
    const isbn = ISBN13;
    if (!isbn || isbn.trim() === "") {
      return false;
    }
    console.log("ISBN 13 Valide deja dans la db ", ISBN13);
    const cleanedISBN = isbn.replace(/[-\s]/g, '');
    const isbn13Regex = /^\d{13}$/;
    return isbn13Regex.test(cleanedISBN);
  } catch (error) {
    console.error("Erreur lors de la vérification de l'ISBN :", error);
    return false;
  }
}

export async function generateISBN13(ISBN10: string | null): Promise<string | null> {
  try {
    
    if (!ISBN10 || ISBN10.trim() === "") {
      console.error("Le livre ne possède pas d'ISBN_10 pour générer l'ISBN_13.");
      return null;
    }
    
    const newIsbn13 = convertISBN10toISBN13(ISBN10);

    await db
      .update(books)
      .set({ ISBN_13: newIsbn13 })
      .where(eq(books.ISBN_10, ISBN10))
      .execute();
    
    console.log(`ISBN-13 généré pour l'ISBN 10 : ${ISBN10} : ${newIsbn13}`);
    return newIsbn13;
  } catch (error) {
    console.error("Erreur lors de la génération de l'ISBN-13 :", error);
    return null;
  }
}

export async function generateBarcode(copyId: number, ISBN10: string | null, ISBN13: string | null): Promise<string | null> {
    try {
  
      let isbn13: string | null = null;

      if (await hasValidISBN13(ISBN13)) {
        isbn13 = ISBN13;
      } else {
        isbn13 = await generateISBN13(ISBN10);
      }
      if (!isbn13) {
        console.error("Impossible d'obtenir un ISBN-13 pour le livre.");
        return null;
      }
  
      const formattedCopyId = String(copyId).padStart(4, '0');
      const barcodeText = `${isbn13}-${formattedCopyId}`;
  
      console.log("barcode text : ", barcodeText);
  
      await db.update(copy)
          .set({ barcode: barcodeText })
          .where(eq(copy.id, copyId))
          .execute();
  
      return barcodeText;
    } catch (error) {
      console.error("Erreur lors de la génération du code-barres pour l'exemplaire :", error);
      return null;
    }
  }
  