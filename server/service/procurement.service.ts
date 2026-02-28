import { asc, isNotNull } from "drizzle-orm"
import { procurements } from "../database/schema"

export async function getProcurementPMs() {
    const db = useDrizzle()

    const results = await db
        .select({ pm: procurements.pm })
        .from(procurements)
        .where(isNotNull(procurements.pm))
        .groupBy(procurements.pm)
        .orderBy(asc(procurements.pm))
        .all()

    return results.map((row) => row.pm).filter(Boolean)
}