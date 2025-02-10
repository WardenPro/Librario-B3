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
                message: "Reservation not found or no changes applied.",
                reservation: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Reservation successfully updated.",
                updatedReservation,
            });
        }
    } catch (error) {
        console.error("Error while updating the reservation:", error);
        res.status(500).json({
            message: "Error while updating the reservation.",
            error,
        });
    }
});
