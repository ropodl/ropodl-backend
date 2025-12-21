import { db } from "../../db/db.js";
import { error } from "../../utils/error.js";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { userSchema, roles, permissions, rolePermissions } from "../../schema/users.js";
import bcrypt from "bcrypt";
import type { Context } from "hono";

export const login = () => async (c: Context) => {
    const { email, password } = await c.req.json();

    const usersResult = await db.select({
        user: userSchema,
        role: roles,
    })
        .from(userSchema)
        .leftJoin(roles, eq(userSchema.roleId, roles.id))
        .where(eq(userSchema.email, email))
        .limit(1);

    if (!usersResult.length) return error(c, 'Email/Password do not match', 404)
    const { user, role } = usersResult[0];

    const comparePassword = await bcrypt.compare(password, user.password)
    if (!comparePassword) return error(c, 'Email/Password do not match', 404)

    // Fetch permissions
    let userPermissions: string[] = [];
    if (role) {
        const perms = await db.select({
            name: permissions.name
        })
            .from(permissions)
            .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
            .where(eq(rolePermissions.roleId, role.id));

        userPermissions = perms.map(p => p.name);
    }

    const payload = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        role: role?.name || 'user',
        permissions: userPermissions,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Token expires in 1 day
    }

    const token = await sign(payload, <string>process.env.APP_KEY)

    return c.json({
        message: "Logged in Successfully",
        token
    });
}