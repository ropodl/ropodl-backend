import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf'
import { appendTrailingSlash } from 'hono/trailing-slash';

import { serveStatic } from '@hono/node-server/serve-static';
import 'dotenv/config';

import routes from './src/route/index.js';

const app = new Hono();
app.use(logger());
app.use(cors());
app.use(csrf({ origin: ['http://localhost:3000', 'https://ropodl.com'] }))
app.use(appendTrailingSlash())

app.get("/", async (c) => {
  return c.json({ message: "Hello World" })
})

app.use('/media/*', serveStatic({ root: './' }));

app.route('/api/v1/', routes);

serve(
  {
    fetch: app.fetch,
    port: parseInt(<any>process.env.APP_PORT) || 8000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
