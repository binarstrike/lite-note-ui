import { Modal } from "bootstrap";
import $ from "jquery";

type ModalStringOptions = {
  title: string;
  body: string;
  positiveButton: string;
  negativeButton: string;
};

type ModalActionButton = keyof Pick<MyModal, "modalNegativeButton" | "modalPositiveButton">;
//    ^?

type SetButtonEventParams = Parameters<MyModal["setButtonEventListener"]>;
//    ^?

export class MyModal {
  private readonly mainModalId = $("#modal-main");
  private modal: Modal;
  private modalElement: JQuery;
  private modalTitle: JQuery;
  private modalBody: JQuery;
  modalPositiveButton: JQuery;
  modalNegativeButton: JQuery;

  constructor(modalName: string, stringOptions?: Partial<ModalStringOptions>) {
    const className = `modal-${modalName}`;
    if (this.mainModalId.length > 1) {
      this.modalElement = this.mainModalId.addClass(className);
    } else {
      this.modalElement = this.mainModalId.clone().addClass(className);
    }

    $(document.body).append(this.modalElement);
    this.modal = new Modal(this.modalElement[0]);
    this.modalTitle = this.modalElement.find("#modal-title");
    this.modalBody = this.modalElement.find("#modal-body");
    this.modalPositiveButton = this.modalElement.find("#modal-positive-button");
    this.modalNegativeButton = this.modalElement.find("#modal-negative-button");

    if (stringOptions) {
      this.setModalTitle(stringOptions.title);
      this.setModalBody(stringOptions.body);
      this.setButtonText("modalPositiveButton", stringOptions.positiveButton);
      this.setButtonText("modalNegativeButton", stringOptions.negativeButton);
    }
  }

  setModalTitle(title?: string): this {
    if (title) this.modalTitle.text(title);
    return this;
  }

  setModalBody(body?: string | HTMLElement): this {
    if (body) {
      if (typeof body === "string") {
        this.modalBody.text(body);
        return this;
      }
      this.modalBody.append(body);
    }
    return this;
  }

  setButtonText<T extends ModalActionButton>(button: T, text?: string): this {
    if (text) this[button].text(text);
    return this;
  }

  setButtonEventListener<K extends keyof HTMLElementEventMap, L extends ModalActionButton>(
    button: L,
    type: K,
    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): this {
    const modalButton = $(this[button]);
    if (modalButton.data("bsDismiss") === "modal") modalButton.removeAttr("data-bs-dismiss");
    // TODO: menghapus event listener pada button jika button tersebut sudah terdapat event listener nya.
    /**
     * ? bingung entah kenapa kalau keluar dari modal tanpa menekan tombol aksi manapun
     * ? event listener untuk button jadi tertumpuk dan lagi cari cara implementasi nya dengan benar.
     */
    (modalButton[0] as HTMLButtonElement).addEventListener(type, listener, options);
    return this;
  }

  setButtonClickEventListener<K extends SetButtonEventParams, L extends ModalActionButton>(
    button: L,
    listener: K[2],
    options?: K[3]
  ): this {
    this.setButtonEventListener(button, "click", listener, options);
    return this;
  }

  modalToggle(): void {
    this.modal.toggle();
  }
}
