import { dashboards } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export async function getAllDashboards() {
    const db = useDrizzle()
    return await db.select().from(dashboards).all()
}

export async function getDashboardById(id: number) {
    const db = useDrizzle()
    const result = await db.select().from(dashboards).where(eq(dashboards.id, id)).get()
    
    if (!result) throw createError({ statusCode: 404, message: 'Dashboard not found' })
    return result
}

export async function updateDashboard(id: number, data: any) {
    const db = useDrizzle()
    
    const { id: _id, createdAt, updatedAt, ...updatedData } = data

    const result = await db.update(dashboards)
        .set({ ...updatedData, updatedAt: new Date() })
        .where(eq(dashboards.id, id))
        .returning()
        .get()

    return result
}