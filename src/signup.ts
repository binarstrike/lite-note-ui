import { SignupFormSchemaType, tokensSchema, TokensSchemaType, signupFormSchema } from "./schema";
import { HttpStatusCode } from "axios";
import { PageEndpoints, isErrorResponse } from "./types";
import { MyModal, MyToast, fetchApi, handleError } from "./utils";

const toast = new MyToast();
const accountConflictModal = new MyModal("account-conflict", {
  title: "Account conflict",
  body: "Akun sudah terdaftar",
  positiveButton: "Login",
  negativeButton: "Close",
})
  .onClick("modalPositiveButton", () => location.replace(PageEndpoints.LOGIN))
  .setToggleButton("modalNegativeButton");

const formInput = {
  username: <HTMLInputElement>document.getElementById("username-form-input"),
  firstname: <HTMLInputElement>document.getElementById("firstname-form-input"),
  lastname: <HTMLInputElement>document.getElementById("lastname-form-input"),
  email: <HTMLInputElement>document.getElementById("email-form-input"),
  password: <HTMLInputElement>document.getElementById("password-form-input"),
};
const submitButton = <HTMLButtonElement>document.getElementById("submit-btn");

submitButton.addEventListener("click", async function (event) {
  event.preventDefault();
  try {
    const signupForm: SignupFormSchemaType = signupFormSchema.parse({
      username: formInput.username.value,
      firstname: formInput.firstname.value,
      lastname: formInput.lastname.value,
      email: formInput.email.value,
      password: formInput.password.value,
    });

    const fetchSignup = await fetchApi<TokensSchemaType, SignupFormSchemaType>(
      "AUTH_SIGNUP",
      signupForm
    );

    const tokens: TokensSchemaType = tokensSchema.parse(fetchSignup.data);
    Object.entries(tokens).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    location.replace(PageEndpoints.ROOT);
  } catch (error) {
    handleError(error, {
      zodError(e) {
        console.error(e);
        const inputError = e![0].path[0];
        toast.showToast({
          title: "Validation error",
          message: `Masukan data pengguna dengan benar ${inputError ? `*${inputError}` : ""}`,
        });
      },
      axiosError(e) {
        const errorResponse = e?.data;
        console.error(errorResponse);
        if (
          isErrorResponse(errorResponse) &&
          errorResponse.statusCode === HttpStatusCode.Conflict
        ) {
          accountConflictModal.modalToggle();
          return;
        }
        toast.showToast({
          title: "API error",
          message: "Terjadi kesalahan saat mengambil data dari API",
        });
      },
      anyError(e) {
        console.error(e?.message);
        toast.showToast({
          title: "Registration error",
          message:
            "Terjadi kesalahan saat penguna mencoba untuk registrasi,\ncoba untuk memuat ulang halaman web",
        });
      },
    });
  }
});
