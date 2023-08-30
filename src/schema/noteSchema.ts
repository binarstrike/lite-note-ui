import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  createdAt: z
    .string()
    .transform((dateStr) => new Date(dateStr))
    .refine((date) => date instanceof Date, { message: "createdAt is not a valid date" }),
  updatedAt: z
    .string()
    .transform((dateStr) => new Date(dateStr))
    .refine((date) => date instanceof Date, { message: "updatedAt is not a valid date" }),
});

export type NoteSchemaType = z.infer<typeof NoteSchema>;
