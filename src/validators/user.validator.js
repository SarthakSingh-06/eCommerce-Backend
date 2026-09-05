import { z } from "zod";

const signupValidationSchema = z.object({
    name: z.string().max(50),
    email: z.email().max(322),
    password: z.string().min(8, "Password must be atleast 8 characters long"),
});

const signinValidationSchema = z.object({
    email: z.email().max(322),
    password: z.string().min(8, "Password must be atleast 8 characters long"),
});

export {
    signupValidationSchema,
    signinValidationSchema
};
