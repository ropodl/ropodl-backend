import { Hono } from 'hono';
import {
  all,
  getOne,
  create,
  update,
  remove,
} from '../../../controller/admin/blog/index.ts';
import categoryRoutes from './category.ts';
import tagRoutes from './tag.ts';
import { authenticate, authorize } from '../../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, authorize('blog.view'), all());
app.get('/:id', authenticate, authorize('blog.view'), getOne());
app.post('/', authenticate, authorize('blog.create'), create());
app.patch('/:id', authenticate, authorize('blog.update'), update());
app.delete('/:id', authenticate, authorize('blog.delete'), remove());

app.route('/category', categoryRoutes);
app.route('/tag', tagRoutes);

export default app;
