import { Hono } from 'hono';
import login from './auth/login.js';
import adminRoutes from './admin/index.ts';
import userRoutes from './user/index.ts';

const app = new Hono();

app.route('/auth', login);
app.route('/', userRoutes);
app.route('/admin', adminRoutes);

export default app;
