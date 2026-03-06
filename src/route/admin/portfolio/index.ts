import { Hono } from 'hono';
import {
  getAllPortfolios,
  getOnePortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../../../controller/admin/portfolio/index.js';
import { authenticate, authorize } from '../../../middleware/admin.js';

const app = new Hono();

app.get('/', authenticate, authorize('portfolio.view'), getAllPortfolios());
app.get('/:id', authenticate, authorize('portfolio.view'), getOnePortfolio());
app.post('/', authenticate, authorize('portfolio.create'), createPortfolio());
app.patch('/:id', authenticate, authorize('portfolio.update'), updatePortfolio());
app.delete('/:id', authenticate, authorize('portfolio.delete'), deletePortfolio());

export default app;
