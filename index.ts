import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { serveStatic } from "@hono/node-server/serve-static";
import "dotenv/config";

import routes from "./src/routes/index.js";

const app = new Hono();
app.use(logger());
app.use(cors());
app.use(csrf());

app.use("/media/*", serveStatic({ root: "./media/" }));

app.route("/api/v1/", routes);

serve(
  {
    fetch: app.fetch,
    port: parseInt(<any>process.env.APP_PORT) || 8000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
