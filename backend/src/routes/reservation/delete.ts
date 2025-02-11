import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { reservation } from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

app.delete("/reservations/:id", checkTokenMiddleware, checkRoleMiddleware(), async (req, res) => {
    try {
        const { id } = req.params;

        const reservedCopy = await db.select({ copy_id: copy.id}).from(copy).where(sql`${copy.id} = ${id}`)

        if (reservedCopy.length === 0) {
            res.status(404).json({
                message: "Reservation not found.",
                reservation: `id: ${id}`,
            });
        } 

        const deletedReservation = await db
            .delete(reservation)
            .where(sql`${reservation.id} = ${id}`)
            .returning();

        await db
        .update(copy)
        .set({ is_reserved: false })
        .where(sql`${copy.id} = ${reservedCopy}`);

        res.status(200).json({
            message: "Reservation successfully deleted.",
            deletedReservation,
        });
    } catch (error) {
        console.error("Error while deleting the reservation:", error);
        res.status(500).json({
            message: "Error while deleting the reservation.",
            error,
        });
    }
});
