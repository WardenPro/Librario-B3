import { lt, eq, and, inArray } from "drizzle-orm";
import { reservation } from "../../db/schema/reservation";
import { copy } from "../../db/schema/copy";
import { db } from "../config/database";

export async function expired_reservation() {
    try {
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const expiredReservations = await db
            .select({
                reservationId: reservation.id,
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
            console.log(
                "📅 [INFO] Found expired reservations. Removing them from the database ...",
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

            console.log("✅ [INFO] Expired reservations removed successfully.");
        } else {
            console.log("📅 [INFO] No expired reservations found.");
        }
    } catch (error) {
        console.error(error);
    }
}