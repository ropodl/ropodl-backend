import { Hono } from "hono";

const app = new Hono();

app.get('blog', async(c)=>{
    return c.json({
        'hi':'hi'
    })
});

export default app;