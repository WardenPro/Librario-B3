import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { reservation } from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.delete("/reservations/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReservation = await db
            .delete(reservation)
            .where(sql`${reservation.id} = ${id}`)
            .returning();

        if (deletedReservation.length === 0) {
            res.status(404).json({
                message: "Reservation not found.",
                reservation: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Reservation successfully deleted.",
                deletedReservation,
            });
        }
    } catch (error) {
        console.error("Error while deleting the reservation:", error);
        res.status(500).json({
            message: "Error while deleting the reservation.",
            error,
        });
    }
});
