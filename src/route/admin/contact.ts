import { Hono } from 'hono';
import {
  all,
  getOne,
  updateStatus,
  remove,
} from '../../controller/admin/contact.ts';
import { authenticate, authorize } from '../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, authorize('contact.view'), all());
app.get('/:id', authenticate, authorize('contact.view'), getOne());
app.patch('/:id/status', authenticate, authorize('contact.update'), updateStatus());
app.delete('/:id', authenticate, authorize('contact.delete'), remove());

export default app;
