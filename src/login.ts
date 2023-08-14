import { LoginFormSchemaType, TokensSchemaType, loginFormSchema, tokensSchema } from "./schema";
import { MyModal, MyToast, handleError, fetchApi } from "./utils";
import { PageEndpoints, isErrorResponse } from "./types";
import { HttpStatusCode } from "axios";

const toast = new MyToast();
const userNotFoundModal = new MyModal("login-error", {
  title: "Login error",
  body: "Akun pengguna tidak ditemukan",
  positiveButton: "Buat Akun",
  negativeButton: "Close",
})
  .onClick("modalPositiveButton", () => location.replace(PageEndpoints.SIGNUP))
  .setToggleButton("modalNegativeButton");

const formInput = {
  email: <HTMLInputElement>document.getElementById("email-form-input"),
  password: <HTMLInputElement>document.getElementById("password-form-input"),
};

const loginButton = <HTMLButtonElement>document.getElementById("login-btn");

loginButton.addEventListener("click", async function (event) {
  event.preventDefault();
  try {
    const loginForm: LoginFormSchemaType = loginFormSchema.parse({
      email: formInput.email.value,
      password: formInput.password.value,
    });

    const fetchLogin = await fetchApi<TokensSchemaType, LoginFormSchemaType>(
      "AUTH_SIGNIN",
      loginForm
    );

    const loginResponseData = fetchLogin.data;

    const tokens = tokensSchema.parse(loginResponseData);
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
        const errorResponseData = e?.data;
        if (isErrorResponse(errorResponseData)) {
          console.error(errorResponseData);
          switch (errorResponseData.statusCode) {
            case HttpStatusCode.NotFound:
              userNotFoundModal.modalToggle();
              return;
            case HttpStatusCode.Unauthorized:
              toast.showToast({
                title: "Invalid login information",
                message: "Masukan email dan password dengan benar",
              });
              return;
          }
        }
        toast.showToast({
          title: "API error",
          message: "Terjadi kesalahan saat mengambil data dari API",
        });
      },
      anyError(e) {
        console.error(e?.message);
        toast.showToast({
          title: "Login error",
          message:
            "Terjadi kesalahan saat pengguna mencoba untuk login,\ncoba untuk memuat ulang halaman web",
        });
      },
    });
  }
});
