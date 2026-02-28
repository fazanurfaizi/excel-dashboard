import { getAllDashboards } from '~~/server/service/cms.service'

export default defineEventHandler(async (event) => {
    const results = await getAllDashboards()
    return { status: 200, data: results }
})