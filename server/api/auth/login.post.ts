export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const validUsername = config.username || event.context.cloudflare.env.NUXT_USERNAME
    const validPassword = config.password || event.context.cloudflare.env.NUXT_PASSWORD

    if (!validUsername || !validPassword) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Please define username and password'
        })
    }

    if (body.username === validUsername && body.password === validPassword) {
        return {
            token: 'cms-autheticated-token-xyz'
        }
    }

    throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
    })
})