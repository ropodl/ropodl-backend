import { Hono } from "hono";

const app = new Hono()

app.get('/', async (c) => {

    let a = []

    for (let i = 0; i < 10; i++) {
        a.push({
            src: "https://images.unsplash.com/photo-1761839257789-20147513121a?q=10&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        })
    }

    return c.json(a)
})

export default app
