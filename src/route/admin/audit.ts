import { Hono } from 'hono';
import { all } from '../../controller/admin/audit.ts';
import { authenticate, authorize } from '../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, authorize('settings.view'), all());

export default app;
