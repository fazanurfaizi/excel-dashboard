import { isNotNull } from 'drizzle-orm'
import { installations, procurements } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
    try {
        const db = useDrizzle(event)
        
        const instResults = await db
            .select({ pm: installations.pm })
            .from(installations)
            .where(isNotNull(installations.pm))
            .groupBy(installations.pm)
            .all()
        
        const procResults = await db
            .select({ pm: procurements.pm })
            .from(procurements)
            .where(isNotNull(procurements.pm))
            .groupBy(procurements.pm)
            .all()
    
        const allPms = [...instResults, ...procResults]
            .map((row) => row.pm)
            .filter(Boolean)
              
        const uniquePms = [...new Set(allPms)].sort()
        
        return {
            status: 200,
            data: uniquePms
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to fetch PMs'
        })
    }
})