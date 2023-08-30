import { fetchApi, getAuthToken } from ".";
import { NoteSchemaType } from "../schema";
import { NoteQueryParams } from "../types";

/**
 * @example
 * ```ts
 * const fetchNotes = await getNotes(); //* mengembalikan semua catatan dalam bentuk array
 * const fetchNote = await getNotes("id catatan"); //* mengembalikan catatan berdasarkan id catatan dalam bentuk array
 * ```
 * @param id - id catatan
 */
export async function getNotes(id?: string): Promise<NoteSchemaType[]> {
  const headers = getAuthToken("ACCESS_TOKEN").headers;
  const fetchNotes = await fetchApi<NoteSchemaType[]>(
    "NOTE_GET_NOTES",
    null,
    id ? { params: { noteId: id } satisfies NoteQueryParams, headers } : { headers }
  );
  return fetchNotes.data;
}
