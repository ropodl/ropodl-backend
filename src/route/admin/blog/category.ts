import { Hono } from 'hono';
import {
  all,
  create,
  update,
  remove,
} from '../../../controller/admin/blog/category.ts';
import { authenticate, authorize } from '../../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, authorize('blog.category.view'), all());
app.post('/', authenticate, authorize('blog.category.create'), create());
app.patch('/:id', authenticate, authorize('blog.category.update'), update());
app.delete('/:id', authenticate, authorize('blog.category.delete'), remove());

export default app;
