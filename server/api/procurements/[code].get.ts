import { eq, and, desc } from 'drizzle-orm'
import { procurements } from '~~/server/database/schema'
import { useDrizzle } from '~~/server/utils/db'

export default eventHandler(async (event) => {
    const code = getRouterParam(event, 'code')
        
    if (!code) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
        })
    }

    const db = useDrizzle(event)
    
    const result = await db.select()
        .from(procurements)
        .where(
            and(
                eq(procurements.projectCode, String(code)),
            )
        )
        .limit(1)
        .orderBy(desc(procurements.no))
        .get()

    return result
})