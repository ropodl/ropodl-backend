import { Hono } from 'hono';
import login from './auth/login.js';
import media from './media/index.js';
import rbac from './rbac/index.js';
import blog from './blog/index.js';

const app = new Hono();

app.route('/auth/', login);
app.route('/media/', media);
app.route('/rbac/', rbac);

app.route('/blog/', blog);

export default app;
