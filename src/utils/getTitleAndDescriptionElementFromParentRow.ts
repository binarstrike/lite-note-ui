import { NoteFormSchemaType } from "../schema";

export const getTitleAndDescriptionElementFromParentRow = (parentRow: JQuery<HTMLElement>) => {
  return {
    parentRow,
    title: parentRow.find("#note-title"),
    description: parentRow.find("#note-description"),
  } satisfies Record<keyof NoteFormSchemaType | "parentRow", JQuery<HTMLElement>>;
};
