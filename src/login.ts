import { LoginFormSchemaType, TokensSchemaType, loginFormSchema, tokensSchema } from "./schema";
import { MyModal, MyToast, handleError, fetchApi } from "./utils";
import { PageEndpoints, isErrorResponse } from "./types";
import { HttpStatusCode } from "axios";

const toast = new MyToast();
const loginErrorModal = new MyModal("login-error", {
  title: "Login error",
  body: "User not found, try to create new account",
  positiveButton: "Create Account",
  negativeButton: "Close",
}).setButtonClickEventListener("modalPositiveButton", () => location.replace(PageEndpoints.SIGNUP));

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
        toast.showToast({
          title: "Validation error",
          message: `Please input ${e?.[0].path} for login information correctly`,
        });
      },
      axiosError(e) {
        const errorResponseData = e?.data;
        if (isErrorResponse(errorResponseData)) {
          console.error(errorResponseData);
          switch (errorResponseData.statusCode) {
            case HttpStatusCode.NotFound:
              loginErrorModal.modalToggle();
              break;
            case HttpStatusCode.Unauthorized:
              toast.showToast({
                title: "Credential error",
                message: "Please input login information correctly",
              });
              break;
            default:
              toast.showToast({
                title: "API error",
                message: "Error when trying to fetch API for user login",
              });
          }
        }
      },
      anyError(e) {
        console.error(e?.message);
        toast.showToast({
          title: "Login Error",
          message: "An error occurred when user trying to login",
        });
      },
    });
  }
});
