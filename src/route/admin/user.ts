import { Hono } from 'hono';
import { updateProfile } from '../../controller/admin/user.ts';
import { authenticate } from '../../middleware/admin.ts';

const app = new Hono();

app.patch('/profile', authenticate, updateProfile());

export default app;
