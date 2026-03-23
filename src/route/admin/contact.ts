import { Hono } from 'hono';
import {
  all,
  getOne,
  updateStatus,
  remove,
} from '../../controller/admin/contact.ts';
import { authenticate } from '../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, all());
app.get('/:id', authenticate, getOne());
app.patch('/:id/status', authenticate, updateStatus());
app.delete('/:id', authenticate, remove());

export default app;
