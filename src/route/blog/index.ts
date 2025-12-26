import { Hono } from "hono";
import { all, getOne, create, update, remove } from "../../controller/blog/index.ts";

const app = new Hono();

app.get("/", all());
app.get("/:slug", getOne());
app.post("/", create());
app.patch("/:slug", update());
app.delete("/:slug", remove());

export default app;