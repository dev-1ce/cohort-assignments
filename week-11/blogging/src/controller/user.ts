import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { signinSchema, signupSchema } from '../zod/user';
import { Jwt } from 'hono/utils/jwt';
import { Context } from 'hono';

enum StatusCode {
    BADREQ = 400,
    NOTFOUND = 404,
    NOTPERMISSIOON = 403,
}

export async function signup(c:Context){
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());

      try {
        const body: {
          username: string;
          email: string;
          password: string;
        } = await c.req.json();
    
        const parsedUser = signupSchema.safeParse(body);
    
        if (!parsedUser.success) {
          return c.body('Invalid user input', StatusCode.BADREQ);
        }
    
        const isUserExist = await prisma.user.findFirst({
          where: { email: body.email },
        });
    
        if (isUserExist) {
          return c.body('email already exist', StatusCode.BADREQ);
        }
    
        const res = await prisma.user.create({
          data: {
            username: body.username,
            email: body.email,
            password: body.password,
          },
        });
    
        const userId = res.id;
    
        const token = await Jwt.sign(userId, c.env.JWT_TOKEN);
    
        return c.json({
          msg: 'User created successfully',
          token: token,
          user: {
            userId: res.id,
            username: res.username,
            email: res.email,
          },
        });
      } catch (error) {
        return c.body(`Internal server error: ${error}`, 500);
      }
}

export async function signin(c:Context){
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{
      const body:{
        email:string,
        password:string
      }=await c.req.json();

      const parsedUser = signinSchema.safeParse(body);
      if(!parsedUser.success){
        return c.body("Invalid inputs",StatusCode.BADREQ);
      }

      const isUserExist = await prisma.user.findFirst({
        where:{
          email:body.email,
          password:body.password
        }
      })
      if(isUserExist==null){
        return c.body("User does not exists",StatusCode.BADREQ)
      }
      const userId = isUserExist.id

      const token = await Jwt.sign(userId, c.env.JWT_TOKEN);

      return c.json({
        msg:"login succesfully",
        token:token,
        user:{
          userId: userId,
          username: isUserExist.username,
          email: isUserExist.email,
        }
      })
    }
    catch(error){
      return c.body(`Internal server error${error}`,500)

    }

}