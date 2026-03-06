import { Hono } from 'hono';
import {
  getAllTypes,
  createType,
  updateType,
  deleteType,
} from '../../../controller/admin/work-type/index.js';
import { authenticate, authorize } from '../../../middleware/admin.js';

const app = new Hono();

app.get('/', authenticate, authorize('worktype.view'), getAllTypes());
app.post('/', authenticate, authorize('worktype.create'), createType());
app.patch('/:id', authenticate, authorize('worktype.update'), updateType());
app.delete('/:id', authenticate, authorize('worktype.delete'), deleteType());

export default app;
