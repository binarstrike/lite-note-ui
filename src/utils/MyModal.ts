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
  private modalTitle: JQuery;
  private modalBody: JQuery;
  modalPositiveButton: JQuery;
  modalNegativeButton: JQuery;

  constructor(modalName: string, stringOptions?: Partial<ModalStringOptions>) {
    let modalNew: JQuery;
    const className = `modal-${modalName}`;
    if (this.mainModalId.length > 1) {
      modalNew = this.mainModalId.addClass(className);
    } else {
      modalNew = this.mainModalId.clone().addClass(className);
    }

    $(document.body).append(modalNew);
    this.modal = new Modal(modalNew[0]);
    this.modalTitle = modalNew.find("#modal-title");
    this.modalBody = modalNew.find("#modal-body");
    this.modalPositiveButton = modalNew.find("#modal-positive-button");
    this.modalNegativeButton = modalNew.find("#modal-negative-button");

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
    // TODO: remove existing event listener
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
