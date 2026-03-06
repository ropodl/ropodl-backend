import type { Context } from 'hono';
import { db } from '../../db/db.ts';
import { userSchema } from '../../schema/users.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { logAction } from '../../utils/audit.ts';

export const updateProfile = () => async (c: Context) => {
  const user = c.get('user') as any;
  if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { fullname, email, password } = body;

  const updateData: any = {};
  if (fullname) updateData.fullname = fullname.trim();
  if (email) updateData.email = email.trim();
  
  if (password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(password, saltRounds);
  }

  if (Object.keys(updateData).length === 0) {
    return c.json({ success: false, message: 'No data to update' }, 400);
  }

  try {
    const [updatedUser] = await db
      .update(userSchema)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userSchema.id, user.id))
      .returning({
        id: userSchema.id,
        username: userSchema.username,
        fullname: userSchema.fullname,
        email: userSchema.email,
      });

    await logAction({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      entity: 'user',
      entityId: user.id,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
    });

    return c.json({ success: true, data: updatedUser });
  } catch (error: any) {
    if (error.code === '23505') {
      return c.json({ success: false, message: 'Email already in use' }, 409);
    }
    return c.json({ success: false, message: error.message }, 400);
  }
};
