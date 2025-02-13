import { lt, eq, and, inArray } from "drizzle-orm";
import { reservation } from "../../db/schema/reservation";
import { copy } from "../../db/schema/copy";
import { db } from "../config/database";
import { logMessage } from "../utils/logger";

export async function expired_reservation() {
    try {
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const expiredReservations = await db
            .select({
                reservationId: reservation.id,
                reservationDate: reservation.reservation_date,
                copyId: copy.id,
            })
            .from(reservation)
            .innerJoin(copy, eq(copy.id, reservation.copy_id))
            .where(
                and(
                    lt(reservation.reservation_date, twoDaysAgo),
                    eq(copy.is_claimed, false),
                ),
            );

        if (expiredReservations.length > 0) {
            logMessage(
                "Found expired reservations. Removing them from the database ...",
            );

            const copyIds = expiredReservations.map((r) => r.copyId);
            await db
                .update(copy)
                .set({ is_reserved: false })
                .where(inArray(copy.id, copyIds));

            const reservationIds = expiredReservations.map(
                (r) => r.reservationId,
            );
            await db
                .delete(reservation)
                .where(inArray(reservation.id, reservationIds));

            logMessage("Expired reservations removed successfully.");
        } else {
            logMessage("No expired reservations found.");
        }
    } catch (error) {
        console.error(error);
    }
}
