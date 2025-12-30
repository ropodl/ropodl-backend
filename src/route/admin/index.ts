import { Hono } from "hono";
import blog from "./blog/index.ts"
import media from './media/index.ts';
import rbac from './rbac/index.ts';

const app = new Hono();

app.route('/blog', blog);
app.route('/media', media);
app.route('/rbac', rbac);

export default app;