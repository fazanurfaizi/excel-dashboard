import { eq, and, desc } from 'drizzle-orm'
import { procurements } from '~~/server/database/schema'
import { useDrizzle } from '~~/server/utils/db'

export default eventHandler(async (event) => {
    const rawName = getRouterParam(event, 'name')
    
    if (!rawName) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
        })
    }

    const name = decodeURIComponent(rawName)

    const db = useDrizzle(event)
    
    const result = await db.select()
        .from(procurements)
        .where(
            and(
                eq(procurements.projectName, name),
            )
        )
        .limit(1)
        .orderBy(desc(procurements.no))
        .get()

    return result
})