import { Hono } from 'hono';
import {
  all,
  getOne,
  create,
  update,
  remove,
} from '../../../controller/admin/blog/index.ts';
import { isAdmin } from '../../../middleware/admin.ts';

const app = new Hono();

app.get('/', isAdmin, all());
app.get('/:id', isAdmin, getOne());
app.post('/', isAdmin, create());
app.patch('/:id', isAdmin, update());
app.delete('/:id', isAdmin, remove());

export default app;
