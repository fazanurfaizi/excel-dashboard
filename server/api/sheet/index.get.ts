import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const spreadsheetId = query.id as string
    const targetSheet = query.sheet as string

    if (!spreadsheetId) {
        throw createError({ statusCode: 400, message: 'Spreadsheet ID is required' })
    }

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch spreadsheet (Status: ${response.status}). Ensure the sheet is shared with "Anyone with the link".`)
        }

        const arrayBuffer = await response.arrayBuffer()
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        if (targetSheet) {
            const worksheet = workbook.Sheets[targetSheet]
            if (!worksheet) {
                throw createError({ statusCode: 404, message: `Sheet "${targetSheet}" not found in workbook` })
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            const limit = query.limit ? parseInt(query.limit as string) : 0
            const data = limit > 0 ? jsonData.slice(0, limit) : jsonData

            return { status: 200, data: data }
        }

        const allSheetsData: Record<string, any[]> = {}

        workbook.SheetNames.forEach(name => {
            const sheet = workbook.Sheets[name]
            if (sheet) {
                allSheetsData[name] = XLSX.utils.sheet_to_json(sheet)
            }
        })

        return {
            status: 200,
            data: allSheetsData,
            sheetNames: workbook.SheetNames
        }

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to process Google Sheet'
        })
    }
})