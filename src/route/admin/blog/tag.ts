import { Hono } from 'hono';
import {
  all,
  create,
  update,
  remove,
} from '../../../controller/admin/blog/tag.ts';
import { authenticate } from '../../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, all());
app.post('/', authenticate, create());
app.patch('/:id', authenticate, update());
app.delete('/:id', authenticate, remove());

export default app;
