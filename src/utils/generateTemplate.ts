export function generateNoteRow({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return /*html*/ `<tr data-note-id="${id}">
    <td class="abbreviation">
      <p id="note-title">${title}</p>
    </td>
    <td class="abbreviation">
      <p id="note-description">${description}</p>
    </td>
    <td>
      <button class="btn btn-sm btn-info fw-semibold" id="note-update-btn">update</button>
      <button class="btn btn-sm btn-warning fw-semibold" id="note-delete-btn">hapus</button>
    </td>
  </tr>`;
}
