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
        throw new z.ZodError([
          {
            path: [key],
            code: "invalid_string",
            validation: "regex",
            message: "Input cannot be empty if it contains only spaces.",
          },
        ] satisfies z.ZodIssue[]);
      } else if (value && typeof +value === "number" && !isNaN(+value)) {
        throw new z.ZodError([
          {
            path: [key],
            code: "invalid_string",
            validation: "regex",
            message: "Input cannot be contains only number.",
          },
        ] satisfies z.ZodIssue[]);
      }
      return true;
    });
  });

export type SignupFormSchemaType = z.infer<typeof signupFormSchema>;
