import { z } from "zod";

const signupValidationSchema = z.object({
    name: z.string().trim().max(50),
    email: z.email().trim().max(322),
    password: z.string().min(8, "Password must be atleast 8 characters long"),
});

const signinValidationSchema = z.object({
    email: z.email().max(322),
    password: z.string().min(8, "Password must be atleast 8 characters long"),
});

const forgotPasswordValidationSchema = z.object({
    email: z.email().max(322),
});

const newPasswordValidationSchema = z.object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
});

const updatePasswordValidationSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

const updateUserDetailsValidationSchema = z.object({
    name: z.string().trim().max(50).optional(),
    email: z.email().trim().max(50).optional(),
}).refine(
    (data) => data.name !== undefined || data.email !== undefined,
    {
        message: "At least one of name or email is required",
    }
);

export {
    signupValidationSchema,
    signinValidationSchema,
    forgotPasswordValidationSchema,
    newPasswordValidationSchema,
    updatePasswordValidationSchema,
    updateUserDetailsValidationSchema,
};
