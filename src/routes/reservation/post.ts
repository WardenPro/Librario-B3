import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { reservation, insertReservationSchema } from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.post("/reservations", checkTokenMiddleware, async (req, res) => {
    try {
        const validatedData = insertReservationSchema.parse(req.body);
        const newReservation = await db.insert(reservation).values(validatedData).returning();
        res.status(201).json({
            message: "Réservation ajoutée avec succès.",
            newReservation,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la réservation :", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de la réservation.",
            error,
        });
    }
});