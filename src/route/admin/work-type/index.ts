import { Hono } from 'hono';
import {
  getAllTypes,
  createType,
  updateType,
  deleteType,
} from '../../../controller/admin/work-type/index.js';
import { authenticate } from '../../../middleware/admin.js';

const app = new Hono();

app.get('/', authenticate, getAllTypes());
app.post('/', authenticate, createType());
app.patch('/:id', authenticate, updateType());
app.delete('/:id', authenticate, deleteType());

export default app;
