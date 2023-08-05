import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

export type LoginFormSchemaType = z.infer<typeof loginFormSchema>;
