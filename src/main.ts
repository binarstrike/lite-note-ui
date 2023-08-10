import "./style.css";
import {
  MyModal,
  MyToast,
  fetchApi,
  generateNoteRow,
  getAuthToken,
  getNotes,
  getTitleAndDescriptionElementFromParentRow,
  refreshToken,
} from "./utils";
import {
  NoteFormSchema,
  NoteFormSchemaType,
  NoteSchema,
  NoteSchemaType,
  TokensSchemaType,
  UserProfileSchema,
} from "./schema";
import { LocalStorageKeys, NotePostParams, PageEndpoints } from "./types";
import { AxiosError, HttpStatusCode } from "axios";
import $ from "jquery";

let isUserLoggedIn: boolean = false,
  currentNoteIdToUpdate: string | any,
  currentNoteIdToDelete: string | any;

const mainTable = $("#main-notes-table"),
  tableBody = $("#notes-list"),
  profileUsername = $("#profile-username"),
  tableUpdateBtnId = "note-update-btn",
  tableDeleteBtnId = "note-delete-btn";

const formCreate = {
  title: $("#create-note-title"),
  description: $("#create-note-description"),
  submit: $("#create-submit-btn"),
};

const formUpdate = {
  title: $("#update-note-title"),
  description: $("#update-note-description"),
  submit: $("#update-submit-btn"),
};

const loginExpiredModal = new MyModal("login-expired", {
  title: "Login Expired",
  body: "You are not logged in",
  positiveButton: "Login",
  negativeButton: "Close",
}).setButtonClickEventListener("modalPositiveButton", () => location.replace(PageEndpoints.LOGIN));

const noteModal = new MyModal("note", {
  positiveButton: "Update Note",
  negativeButton: "Delete Note",
});

const modalPositiveButtonId = "modal-positive-button",
  modalNegativeButtonId = "modal-negative-button";

const toast = new MyToast();

function insertValueToUpdateForm(form: NoteFormSchemaType): void {
  formUpdate.title.val(form.title);
  formUpdate.description.val(form.description);
}

function clearFormInput(): void {
  formCreate.title.val("");
  formCreate.description.val("");
  formUpdate.title.val("");
  formUpdate.description.val("");
  currentNoteIdToDelete = null;
  currentNoteIdToUpdate = null;
}

async function isLoggedIn(): Promise<boolean> {
  if (!getAuthToken("ACCESS_TOKEN").token) return false;
  return (async function _getUser(): Promise<boolean> {
    try {
      const fetchUser = await fetchApi<TokensSchemaType>("USER_INFO", null, {
        headers: getAuthToken("ACCESS_TOKEN").headers,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 401,
      });
      const user = await UserProfileSchema.safeParseAsync(fetchUser.data);
      if (!user.success) throw new Error("Fail to parse object");
      localStorage.setItem(LocalStorageKeys.USER_PROFILE, JSON.stringify(user.data));
      return true;
    } catch (error) {
      if (error instanceof AxiosError && !error.response) return false; //* network error, tidak ada respon dari API server
      const rt = getAuthToken("REFRESH_TOKEN").token;
      if (!rt) return false;
      try {
        const tokens = await refreshToken(rt);
        Object.entries(tokens).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        return _getUser();
      } catch (_) {
        return false;
      }
    }
  })();
}

(async function _fetchNotesAndUser() {
  isUserLoggedIn = await isLoggedIn();
  if (isUserLoggedIn) {
    const user = localStorage.getItem(LocalStorageKeys.USER_PROFILE);
    if (user !== null) {
      const parsedUser = UserProfileSchema.safeParse(JSON.parse(user));
      if (!parsedUser.success) {
        loginExpiredModal.modalToggle();
        return;
      }
      profileUsername.text(parsedUser.data.username);
    }
    const fetchNotes = await getNotes<"many">();
    const arrayOfNote = NoteSchema.array()
      .transform((notes) =>
        //* mengurutkan  s berdasarkan waktu update terakhir
        notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      )
      .parse(fetchNotes);
    //* sebenarnya bisa saja tanpa melakukan pengurutan berdasarkan waktu pada array notes yaitu dengan mengganti fungsi
    //* JQuery .append() ke .prepend() jadi penambahan baris dilakukan dari awal ke akhir
    arrayOfNote.forEach((note) => tableBody.append(generateNoteRow(note)));
    //*                                    .prepend()
  } else {
    loginExpiredModal.modalToggle();
    return;
  }
})();

async function deleteNoteById(id: string): Promise<boolean> {
  if (!isUserLoggedIn) {
    loginExpiredModal.modalToggle();
    return false;
  } else if (!id) {
    toast.showToast({
      title: "Delete error",
      message: "Fail to delete note, please reload the page",
    });
    return false;
  }
  return (async function _noteDelete(): Promise<boolean> {
    try {
      const deleteNote = await fetchApi("NOTE_DELETE_BY_ID", null, {
        headers: getAuthToken("ACCESS_TOKEN").headers,
        params: { noteId: id } satisfies NotePostParams,
      });
      clearFormInput();
      if (deleteNote.status === HttpStatusCode.NoContent) return true;
      throw new Error("Fail to delete note, server not response 204 No Content");
    } catch (error) {
      if (error instanceof AxiosError) {
        isUserLoggedIn = await isLoggedIn();
        if (!isUserLoggedIn) {
          loginExpiredModal.modalToggle();
          return false;
        }
        return _noteDelete();
      }
      toast.showToast({
        title: "API error",
        message: "Fail to delete note, try to reload the page",
      });
      return false;
    }
  })();
}

//* click event listener for create note sumbit button
formCreate.submit.on("click", async function (event) {
  event.preventDefault();
  if (!isUserLoggedIn) {
    loginExpiredModal.modalToggle();
    return;
  }
  const noteInput: NoteFormSchemaType = {
    title: formCreate.title.val() as string,
    description: formCreate.description.val() as string,
  };
  const notePayload = await NoteFormSchema.safeParseAsync(noteInput);
  if (!notePayload.success) {
    toast.showToast({
      title: "Validation error",
      message: "Please input note information correctly",
    });
    return;
  }
  (async function _noteCreate() {
    try {
      const createNote = await fetchApi<NoteSchemaType, NoteFormSchemaType>(
        "NOTE_CREATE",
        notePayload.data,
        { headers: getAuthToken("ACCESS_TOKEN").headers }
      );
      tableBody.prepend(generateNoteRow(createNote.data));
      clearFormInput();
      toast.showToast({ title: "INFO", message: "Success create new note" });
    } catch (error) {
      if (error instanceof AxiosError) {
        //* jika access token sudah tidak valid maka refresh token
        const isUserLoggedIn = await isLoggedIn();
        if (!isUserLoggedIn) {
          loginExpiredModal.modalToggle();
          return;
        }
        _noteCreate(); //* memanggil kembali fungsi setelah refresh token
        return;
      }
      toast.showToast({
        title: "Error",
        message: "An unknown error occurred",
      });
    }
  })();
});

//* click event listener for update note submit button
formUpdate.submit.on("click", async function (event) {
  event.preventDefault();

  if (!isUserLoggedIn) {
    loginExpiredModal.modalToggle();
    return;
  } else if (!currentNoteIdToUpdate) {
    toast.showToast({
      title: "Update error",
      message: "Click one of note update button",
    });
    return;
  }
  const noteInput: NoteFormSchemaType = {
    title: formUpdate.title.val() as string,
    description: formUpdate.description.val() as string,
  };
  const notePayload = await NoteFormSchema.safeParseAsync(noteInput);
  if (!notePayload.success) {
    toast.showToast({
      title: "Validation error",
      message: "Please input note information correctly",
    });
    return;
  }
  (async function _noteUpdate() {
    try {
      const updateNote = await fetchApi<NoteSchemaType, NoteFormSchemaType>(
        "NOTE_UPDATE_BY_ID",
        notePayload.data,
        {
          headers: getAuthToken("ACCESS_TOKEN").headers,
          params: { noteId: currentNoteIdToUpdate } satisfies NotePostParams,
        }
      );
      tableBody.find(`tr[data-note-id='${currentNoteIdToUpdate}']`)[0].remove();
      tableBody.prepend(generateNoteRow(updateNote.data));
      clearFormInput();
      toast.showToast({ title: "INFO", message: "Success update note" });
    } catch (error) {
      if (error instanceof AxiosError) {
        //* jika access token sudah tidak valid maka refresh token
        isUserLoggedIn = await isLoggedIn();
        if (!isUserLoggedIn) {
          loginExpiredModal.modalToggle();
          return;
        }
        _noteUpdate(); //* memanggil kembali fungsi setelah refresh token
        return;
      }
      toast.showToast({
        title: "API error",
        message: "Fail to delete note, try to reload the page",
      });
    }
  })();
});

//* table list of notes
mainTable.on("click", async function (event) {
  const tableTargetElement = $(event.target);

  //* cek jika target element adalah element paragraph
  if (tableTargetElement[0] instanceof HTMLParagraphElement) {
    const colsNote = getTitleAndDescriptionElementFromParentRow(tableTargetElement.closest("tr"));

    noteModal.setModalTitle(colsNote.title.text());
    noteModal.setModalBody(colsNote.description.text());
    noteModal.modalToggle();

    //* fungsi callback ini harus memakai keyword function agar this berada
    //* dalam scope button yang ditekan bukan element parent nya
    //* dalam kasus ini this = document.body
    $(document.body).on("click", async function (e) {
      const targetElement = $(e.target);

      if (targetElement[0] instanceof HTMLButtonElement) {
        const buttonId = targetElement.attr("id");
        if (buttonId === modalPositiveButtonId) {
          currentNoteIdToUpdate = colsNote.parentRow.data("note-id");
          insertValueToUpdateForm({
            title: colsNote.title.text(),
            description: colsNote.description.text(),
          });
          noteModal.modalToggle();
          $(this).off();
        } else if (buttonId === modalNegativeButtonId) {
          currentNoteIdToDelete = colsNote.parentRow.data("note-id");
          const deleteNote = await deleteNoteById(currentNoteIdToDelete);
          if (!deleteNote) {
            toast.showToast({
              title: "Delete note error",
              message: "Fail to delete note, please try to reload the page",
            });
            return;
          }

          noteModal.modalToggle();
          colsNote.parentRow.remove();

          toast.showToast({
            title: "INFO",
            message: "Success delete note",
          });
          noteModal.modalToggle();
          $(this).off();
          return;
        }
        $(this).off();
      } else if (targetElement.attr("id") === "modal-main") $(this).off();
      //* ^^^ jika element diluar element modal di klik maka hapus event listener pada element body
    });
  } else if (tableTargetElement[0] instanceof HTMLButtonElement) {
    //* cek jika target adalah instance dari elemen tag button
    //* target akan menyesuaikan tombol apa yang di klik oleh mouse
    const colsNote = getTitleAndDescriptionElementFromParentRow(tableTargetElement.closest("tr"));
    const buttonId = tableTargetElement.attr("id"); //* button id

    if (buttonId === tableUpdateBtnId) {
      //* update button
      currentNoteIdToUpdate = colsNote.parentRow.data("note-id"); //* table row dataset/data attribut data-note-id
      insertValueToUpdateForm({
        title: colsNote.title.text(),
        description: colsNote.description.text(),
      });
      formUpdate.title[0].focus(); //* change focus to update form input
    } else if (buttonId === tableDeleteBtnId) {
      //* delete button
      currentNoteIdToDelete = colsNote.parentRow.data("note-id");
      const deleteNote = await deleteNoteById(currentNoteIdToDelete);
      if (!deleteNote) {
        toast.showToast({
          title: "Delete note error",
          message: "Fail to delete note, please try to reload the page",
        });
        return;
      }

      colsNote.parentRow.remove();

      toast.showToast({
        title: "INFO",
        message: "Success delete note",
      });
    }
  }
});
