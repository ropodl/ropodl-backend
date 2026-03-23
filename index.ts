import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { compress } from 'hono/compress';
import { trimTrailingSlash } from 'hono/trailing-slash';

import { serveStatic } from '@hono/node-server/serve-static';
import 'dotenv/config';

import routes from './src/route/index.js';
import { pool } from './src/db/db.js';

const app = new Hono();
const port = Number(process.env.APP_PORT ?? process.env.PORT ?? 30033);

if (process.env.NODE_ENV !== 'production') {
  app.use(logger());
}

app.use(cors());
app.use(csrf({ origin: ['http://localhost:3000', 'https://ropodl.com'] }));
app.use(compress());
app.use(trimTrailingSlash());

app.get('/', async (c) => {
  return c.json({ message: 'Hello World' });
});

app.use('/media/*', serveStatic({ root: './' }));

app.route('/api/v1/', routes);

serve(
  {
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0',
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  }
);

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Closing database pool...`);
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
