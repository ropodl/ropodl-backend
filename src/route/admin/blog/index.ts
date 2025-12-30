import { Hono } from "hono";
import { all, getOne, create, update, remove } from "../../../controller/blog/index.ts";
import { isAdmin } from "../../../middleware/admin.ts";

const app = new Hono();

app.get("/", isAdmin, all());
app.get("/:slug", isAdmin, getOne());
app.post("/", isAdmin, create());
app.patch("/:slug", isAdmin, update());
app.delete("/:slug", isAdmin, remove());

export default app;
