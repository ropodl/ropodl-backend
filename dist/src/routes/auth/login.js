import { Hono } from "hono";
const app = new Hono();
app.get("login", (c) => {
    return c.json({
        test: "hi",
    });
});
export default app;
