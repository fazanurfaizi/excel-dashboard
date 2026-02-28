import { processWidgetGeneration } from '~~/server/service/widget.service'

export default defineEventHandler(async (event) => {
    const req = await readBody(event)
    const result = await processWidgetGeneration(req)

    return { status: 200, data: result }
})