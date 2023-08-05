import { Toast } from "bootstrap";
import $ from "jquery";

export class MyToast extends Toast {
  private readonly toastTitle = $("#toast-title");
  private readonly toastMessage = $("#toast-message");
  constructor(toastElement = $("#toast-main")) {
    super(toastElement[0]);
  }
  showToast({ title, message }: { title?: string; message?: string }): void {
    this.toastTitle.text(title ?? "");
    this.toastMessage.text(message ?? "");
    super.show();
  }
}
