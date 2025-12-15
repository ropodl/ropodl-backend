import type { Context } from "hono"
import type { StatusCode } from "hono/utils/http-status"

export const error = async(c: Context, error: string, status: StatusCode = 401) => {
    c.status(status)
    return c.json({ "error": error })
}