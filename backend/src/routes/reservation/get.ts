import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import {
    reservation,
    selectReservationSchema,
} from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

app.get("/reservations", checkTokenMiddleware, checkRoleMiddleware("admin"), async (req, res) => {
    try {
        const allReservations = await db.select().from(reservation);
        const validatedReservations = allReservations.map((r) =>
            selectReservationSchema.parse(r),
        );
        res.status(200).json(validatedReservations);
    } catch (error) {
        console.error("Error while retrieving reservations:", error);
        res.status(500).json({
            message: "Error while retrieving reservations.",
            error,
        });
    }
});

app.get("/reservations/:id", checkTokenMiddleware, checkRoleMiddleware(), async (req, res) => {
    try {
        const { id } = req.params;
        const foundReservation = await db
            .select()
            .from(reservation)
            .where(sql`${reservation.user_id} = ${id}`);

        if (foundReservation.length === 0) {
            res.status(404).json({
                message: "Reservation not found.",
                reservation: `id: ${id}`,
            });
        } else {
            const validatedReservation = foundReservation.map((r) =>
                selectReservationSchema.parse(r),
            );
            res.status(200).json(validatedReservation);
        }
    } catch (error) {
        console.error("Error while retrieving the reservation:", error);
        res.status(500).json({
            message: "Error while retrieving the reservation.",
            error,
        });
    }
});
