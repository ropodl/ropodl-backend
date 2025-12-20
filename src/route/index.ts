import { Hono } from "hono";
import login from "./auth/login.js";
import media from "./media/index.js";

const app = new Hono();

app.route("/auth/", login);
app.route("/media/", media);

export default app;
