import { Hono } from 'hono'
import {userRouter} from "./routes/user"

const app = new Hono()

app.route("/api/v1/user",userRouter)
app.route("/api/v1/posts",)

export default app
