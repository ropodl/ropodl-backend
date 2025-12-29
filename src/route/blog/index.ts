import { Hono } from 'hono';
import { all } from '../../controller/blog/index.ts';

const app = new Hono();

app.get('/', all());

export default app;
