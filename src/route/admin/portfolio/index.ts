import { Hono } from 'hono';
import {
  getAllPortfolios,
  getOnePortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../../../controller/admin/portfolio/index.js';
import { authenticate } from '../../../middleware/admin.js';

const app = new Hono();

app.get('/', authenticate, getAllPortfolios());
app.get('/:id', authenticate, getOnePortfolio());
app.post('/', authenticate, createPortfolio());
app.patch('/:id', authenticate, updatePortfolio());
app.delete('/:id', authenticate, deletePortfolio());

export default app;
