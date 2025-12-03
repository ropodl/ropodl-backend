import { Hono } from "hono";
import login from "./auth/login.js";

const app = new Hono();

app.route("/auth/", login);

export default app;
