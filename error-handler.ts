import type { Middleware } from "@oak/oak";

export const errorHandler: Middleware = async (ctx, next) => {
    try {
        await next()
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        ctx.response.status = error.status
        ctx.response.body = { message: error.message }
    }
}