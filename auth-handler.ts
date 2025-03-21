import { type Context, createHttpError, Status, type Middleware } from "jsr:@oak/oak";
import type { Session } from "https://deno.land/x/oak_sessions@v9.0.0/mod.ts";
import jwt from 'npm:jsonwebtoken'
import process from "node:process";

export const authHandler: Middleware<{ session: Session }> = async (ctx: Context<{ session: Session }>, next) => {
    try {
        const parsedJTW = await ctx.state.session.get('jwt') as string
        if (!parsedJTW) {
            throw createHttpError(Status.Unauthorized, 'Provide a valid authentication.')
        }
        const token = parsedJTW.replace('Bearer ', "")

        const isLogged = jwt.verify(token, process.env.JWT_KEY)
        if (!isLogged) {
            throw createHttpError(Status.Unauthorized, 'Provide a valid authentication.')
        }
        ctx.user = isLogged
        ctx.response.body = isLogged
        await next()

        // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        ctx.response.status = error.status
        ctx.response.body = { message: error.message }
    }
}