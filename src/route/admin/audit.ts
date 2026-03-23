import { Hono } from 'hono';
import { all } from '../../controller/admin/audit.ts';
import { authenticate } from '../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, all());

export default app;
