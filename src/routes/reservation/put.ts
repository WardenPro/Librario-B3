import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import {
    reservation,
    updateReservationSchema,
} from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.put("/reservations/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateReservationSchema.parse(req.body);
        const updatedReservation = await db
            .update(reservation)
            .set(validatedData)
            .where(sql`${reservation.id} = ${id}`)
            .returning();

        if (updatedReservation.length === 0) {
            res.status(404).json({
                message:
                    "Réservation non trouvée ou aucune modification appliquée.",
                reservation: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Réservation mise à jour avec succès.",
                updatedReservation,
            });
        }
    } catch (error) {
        console.error(
            "Erreur lors de la mise à jour de la réservation :",
            error,
        );
        res.status(500).json({
            message: "Erreur lors de la mise à jour de la réservation.",
            error,
        });
    }
});
