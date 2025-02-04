import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { reservation, selectReservationSchema } from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.get("/reservations", checkTokenMiddleware, async (req, res) => {
    try {
        const allReservations = await db.select().from(reservation);
        const validatedReservations = allReservations.map((r) => selectReservationSchema.parse(r));
        res.status(200).json(validatedReservations);
    } catch (error) {
        console.error("Erreur lors de la récupération des réservations :", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des réservations.",
            error,
        });
    }
});

app.get("/reservations/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const foundReservation = await db
            .select()
            .from(reservation)
            .where(sql`${reservation.id} = ${id}`);

        if (foundReservation.length === 0) {
            res.status(404).json({
                message: "Réservation non trouvée.",
                reservation: `id: ${id}`,
            });
        } else {
            const validatedReservation = foundReservation.map((r) => selectReservationSchema.parse(r));
            res.status(200).json(validatedReservation);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de la réservation :", error);
        res.status(500).json({
            message: "Erreur lors de la récupération de la réservation.",
            error,
        });
    }
});