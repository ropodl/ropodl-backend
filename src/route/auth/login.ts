import { Hono } from 'hono';
import { authenticate } from '../../middleware/admin.js';
import { login, setup } from '../../controller/auth/login.js';

const app = new Hono();

app.post('login', login());

app.post('setup', setup());

app.get('me', authenticate, async (c) => {
  const user = await c.get<any>('user');
  return c.json(user);
});

export default app;
