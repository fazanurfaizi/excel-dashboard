import { eq, and, desc } from 'drizzle-orm'
import { installations } from '~~/server/database/schema'
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
        .from(installations)
        .where(
            and(
                eq(installations.projectCode, String(code)),
            )
        )
        .limit(1)
        .orderBy(desc(installations.no))
        .get()

    return result
})