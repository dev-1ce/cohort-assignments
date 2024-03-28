import { Hono } from "hono";

export const userRouter = new Hono();

userRouter.post("/signin");
userRouter.post("/signup");

