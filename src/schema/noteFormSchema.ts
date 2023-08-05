import { z } from "zod";

export const NoteFormSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
});

export type NoteFormSchemaType = z.infer<typeof NoteFormSchema>;
