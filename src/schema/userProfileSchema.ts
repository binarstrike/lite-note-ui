import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string().nullable(),
  updatedAt: z.string().transform((dateStr) => new Date(dateStr).toISOString()),
  createdAt: z.string().transform((dateStr) => new Date(dateStr).toISOString()),
});

export type UserProfileSchemaType = z.infer<typeof UserProfileSchema>;
