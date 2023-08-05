import { z } from "zod";

export const signupFormSchema = z
  .object({
    username: z
      .string()
      .nonempty()
      .toLowerCase()
      .refine((value) => !/^[0-9\s]+$/.test(value), "username can't only contains number")
      .refine((value) => !/\s/.test(value), "username can't contains space character"),
    firstname: z.string().nonempty(),
    lastname: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (!v ? null : v)),
    email: z.string().nonempty().email(),
    password: z.string().nonempty(),
  })
  .refine((obj) => {
    return Object.entries(obj).every(([key, value]) => {
      if (value && typeof value == "string" && value.trim() === "") {
        throw new Error(`${key} cannot be empty if it contains only spaces.`);
      } else if (value && typeof +value === "number" && !isNaN(+value)) {
        throw new Error(`${key} cannot be contains only number`);
      }
      return true;
    });
  });

export type SignupFormSchemaType = z.infer<typeof signupFormSchema>;
