import { Hono } from 'hono';
import blog from './blog.ts';
import contact from './contact.ts';

const app = new Hono();

app.route('blog', blog);
app.route('contact', contact);

export default app;
