import { Hono } from 'hono';
import blog from './blog/index.ts';
import media from './media/index.ts';
import role from './role/index.ts';
import permission from './permission/index.ts';

const app = new Hono();

app.route('/blog', blog);
app.route('/media', media);
app.route('/roles', role);
app.route('/permission', permission);

export default app;
