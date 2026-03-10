import { eq, and, desc } from 'drizzle-orm'
import { installations } from '~~/server/database/schema'
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
        
    if (!name) {
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
                eq(installations.projectName, name),
            )
        )
        .limit(1)
        .orderBy(desc(installations.no))
        .get()

    return result
})