import { Hono } from 'hono';
import blog from './blog.ts';

const app = new Hono();

app.route('blog', blog);

export default app;
