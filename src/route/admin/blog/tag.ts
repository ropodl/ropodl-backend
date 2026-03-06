import { Hono } from 'hono';
import {
  all,
  create,
  update,
  remove,
} from '../../../controller/admin/blog/tag.ts';
import { authenticate, authorize } from '../../../middleware/admin.ts';

const app = new Hono();

app.get('/', authenticate, authorize('blog.tag.view'), all());
app.post('/', authenticate, authorize('blog.tag.create'), create());
app.patch('/:id', authenticate, authorize('blog.tag.update'), update());
app.delete('/:id', authenticate, authorize('blog.tag.delete'), remove());

export default app;
