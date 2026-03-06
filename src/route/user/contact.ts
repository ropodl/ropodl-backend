import { Hono } from 'hono';
import { create } from '../../controller/admin/contact.ts';

const app = new Hono();

app.post('/', create());

export default app;
