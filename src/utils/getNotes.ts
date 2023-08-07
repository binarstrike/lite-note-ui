import { fetchApi, getAuthToken } from ".";
import { NoteSchemaType } from "../schema";

/**
 * @example
 * ```ts
 * const fetchNotes = await getNotes<"many">(); // return array of note object
 * const fetchNote = await getNotes("id of note"); // return note object
 * ```
 * @param id id of note
 * @returns
 */
export async function getNotes<
  T extends "many" | undefined = undefined,
  U = T extends "many" ? NoteSchemaType[] : NoteSchemaType
>(id?: string): Promise<U> {
  const headers = getAuthToken("ACCESS_TOKEN").headers;
  const fetchNotes = await fetchApi<U>(
    "NOTE_GET_NOTES",
    null,
    id ? { params: { noteId: id }, headers } : { headers }
  );
  return fetchNotes.data;
}
