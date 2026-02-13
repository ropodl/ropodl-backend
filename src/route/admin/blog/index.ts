import { Hono } from 'hono';
import {
  all,
  getOne,
  create,
  update,
  remove,
} from '../../../controller/admin/blog/index.ts';
import { authenticate } from '../../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, all());
app.get('/:id', authenticate, getOne());
app.post('/', authenticate, create());
app.patch('/:id', authenticate, update());
app.delete('/:id', authenticate, remove());

export default app;
