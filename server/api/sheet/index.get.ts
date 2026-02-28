import { getSheetData } from '~~/server/service/sheet.service'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const spreadsheetId = query.id as string
    const targetSheet = query.sheet as string
    const limit = query.limit ? parseInt(query.limit as string) : 0

    if (!spreadsheetId) {
        throw createError({ statusCode: 400, message: 'Spreadsheet ID is required' })
    }

    try {
        const result = await getSheetData(spreadsheetId, targetSheet, limit)
        return { status: 200, ...result }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to process Google Sheet'
        })
    }
})