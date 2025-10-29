import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { X } from "lucide-static";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

const TwLitElement = TW(LitElement);

/**
 * Dialog component properties
 */
export interface DialogProperties {
  open?: boolean;
  modal?: boolean;
}

export interface DialogTriggerProperties {
  disabled?: boolean;
}

export interface DialogContentProperties {
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
}

export interface DialogCloseEvent {
  reason: "escape" | "backdrop" | "close-button" | "programmatic";
}

/**
 * Root dialog container managing state
 */
@customElement("ui-dialog")
export class Dialog extends TwLitElement implements DialogProperties {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;

  @query("ui-dialog-content") contentElement?: DialogContent;

  render() {
    return html`
      <style>
        :host {
          display: contents;
        }
      </style>
      <slot name="trigger"></slot>
      <slot name="content"></slot>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      "trigger-click",
      this.handleTriggerClick as EventListener,
    );
    this.addEventListener(
      "content-close",
      this.handleContentClose as EventListener,
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      "trigger-click",
      this.handleTriggerClick as EventListener,
    );
    this.removeEventListener(
      "content-close",
      this.handleContentClose as EventListener,
    );
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      // Dispatch open-change event
      this.dispatchEvent(
        new CustomEvent("open-change", {
          detail: { open: this.open },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleTriggerClick = () => {
    this.open = !this.open;
  };

  private handleContentClose = (e: CustomEvent) => {
    this.open = false;

    this.dispatchEvent(
      new CustomEvent("dialog-close", {
        detail: { reason: e.detail.reason },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

/**
 * Dialog trigger button
 */
@customElement("ui-dialog-trigger")
export class DialogTrigger
  extends TwLitElement
  implements DialogTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <style>
        :host {
          display: contents;
        }
      </style>
      <div @click=${this.handleClick}>
        <slot></slot>
      </div>
    `;
  }

  private handleClick = () => {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent("trigger-click", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };
}

/**
 * Dialog content with native dialog element
 */
@customElement("ui-dialog-content")
export class DialogContent
  extends TwLitElement
  implements DialogContentProperties
{
  @property({ type: Boolean }) closeOnEscape = true;
  @property({ type: Boolean }) closeOnBackdrop = true;

  @query("dialog") dialogElement!: HTMLDialogElement;
  @state() private isOpen = false;
  @state() private isAnimating = false;

  private previouslyFocusedElement?: HTMLElement;
  private observer?: MutationObserver;
  private _pendingStateChange?: symbol;

  render() {
    // Only render when open or animating
    if (!this.isOpen && !this.isAnimating) {
      return nothing;
    }

    return html`
      <dialog
        class=${cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200",
          "backdrop:bg-black/80",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "sm:rounded-lg",
          this.className,
        )}
        data-state=${this.isOpen ? "open" : "closed"}
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
      >
        <div class="p-6">
          <slot></slot>
        </div>
        <ui-dialog-close></ui-dialog-close>
      </dialog>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Sync with parent dialog state
    const dialog = this.closest("ui-dialog") as Dialog | null;
    if (dialog) {
      this.isOpen = dialog.open;

      // Observe parent dialog for open attribute changes
      this.observer = new MutationObserver(() => {
        const shouldOpen = dialog.open;
        if (shouldOpen !== this.isOpen) {
          if (shouldOpen) {
            this.showDialog(dialog.modal);
          } else {
            this.closeDialog();
          }
        }
      });
      this.observer.observe(dialog, {
        attributes: true,
        attributeFilter: ["open"],
      });

      // Show dialog if already open
      if (dialog.open) {
        // Wait for first render
        this.updateComplete.then(() => {
          this.showDialog(dialog.modal);
        });
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
  }

  override firstUpdated() {
    // Link title and description for accessibility
    const title = this.querySelector("ui-dialog-title");
    const description = this.querySelector("ui-dialog-description");

    if (title) {
      const titleId =
        title.id ||
        `dialog-title-${Math.random().toString(36).substring(2, 11)}`;
      title.id = titleId;
      this.dialogElement?.setAttribute("aria-labelledby", titleId);
    }

    if (description) {
      const descId =
        description.id ||
        `dialog-desc-${Math.random().toString(36).substring(2, 11)}`;
      description.id = descId;
      this.dialogElement?.setAttribute("aria-describedby", descId);
    }
  }

  private showDialog(modal: boolean) {
    const stateId = Symbol();
    this._pendingStateChange = stateId;

    this.isOpen = true;
    this.isAnimating = true;

    // Wait for render
    this.updateComplete.then(() => {
      // Ignore stale calls
      if (this._pendingStateChange !== stateId) return;
      if (!this.dialogElement) return;

      this.previouslyFocusedElement = document.activeElement as HTMLElement;

      if (modal) {
        this.dialogElement.showModal();
      } else {
        this.dialogElement.show();
      }

      // Use animationend event for opening animation too
      const handleAnimationEnd = () => {
        if (this._pendingStateChange !== stateId) return;
        this.isAnimating = false;
        this.dialogElement?.removeEventListener(
          "animationend",
          handleAnimationEnd,
        );
      };

      this.dialogElement?.addEventListener("animationend", handleAnimationEnd);

      // Fallback timeout in case animation doesn't fire
      setTimeout(() => {
        if (this.isAnimating && this._pendingStateChange === stateId) {
          handleAnimationEnd();
        }
      }, 300);
    });
  }

  private closeDialog() {
    const stateId = Symbol();
    this._pendingStateChange = stateId;

    this.isOpen = false;
    this.isAnimating = true;

    // Use animationend event for proper sync
    const handleAnimationEnd = () => {
      // Ignore stale calls
      if (this._pendingStateChange !== stateId) return;

      if (this.dialogElement?.open) {
        this.dialogElement.close();
      }
      this.isAnimating = false;
      this.previouslyFocusedElement?.focus();
      this.dialogElement?.removeEventListener(
        "animationend",
        handleAnimationEnd,
      );
    };

    this.dialogElement?.addEventListener("animationend", handleAnimationEnd);

    // Fallback timeout in case animation doesn't fire
    setTimeout(() => {
      if (this.isAnimating && this._pendingStateChange === stateId) {
        handleAnimationEnd();
      }
    }, 300);
  }

  private handleCancel = (e: Event) => {
    // Cancel event is fired when ESC is pressed
    if (!this.closeOnEscape) {
      e.preventDefault();
      return;
    }

    this.dispatchEvent(
      new CustomEvent("content-close", {
        detail: { reason: "escape" },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleBackdropClick = (e: MouseEvent) => {
    if (!this.closeOnBackdrop) return;

    // Check if click is on backdrop (dialog element itself, not children)
    const rect = this.dialogElement?.getBoundingClientRect();
    if (!rect) return;

    const clickedInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    // If click is outside the dialog bounds (on the backdrop)
    if (!clickedInDialog || e.target === this.dialogElement) {
      this.dispatchEvent(
        new CustomEvent("content-close", {
          detail: { reason: "backdrop" },
          bubbles: true,
          composed: true,
        }),
      );
    }
  };
}

/**
 * Dialog header container
 */
@customElement("ui-dialog-header")
export class DialogHeader extends TwLitElement {
  render() {
    return html`
      <div
        class=${cn(
          "flex flex-col space-y-1.5 text-center sm:text-left",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Dialog title (required for accessibility)
 */
@customElement("ui-dialog-title")
export class DialogTitle extends TwLitElement {
  render() {
    return html`
      <h2
        class=${cn(
          "text-lg font-semibold leading-none tracking-tight",
          this.className,
        )}
      >
        <slot></slot>
      </h2>
    `;
  }
}

/**
 * Dialog description
 */
@customElement("ui-dialog-description")
export class DialogDescription extends TwLitElement {
  render() {
    return html`
      <p class=${cn("text-sm text-muted-foreground", this.className)}>
        <slot></slot>
      </p>
    `;
  }
}

/**
 * Dialog footer container
 */
@customElement("ui-dialog-footer")
export class DialogFooter extends TwLitElement {
  render() {
    return html`
      <div
        class=${cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Dialog close button
 */
@customElement("ui-dialog-close")
export class DialogClose extends TwLitElement {
  static styles = css`
    :host {
      position: absolute;
      right: 1rem;
      top: 1rem;
    }
  `;

  render() {
    return html`
      <button
        type="button"
        class=${cn(
          "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
          "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:pointer-events-none",
          this.className,
        )}
        @click=${this.handleClick}
        aria-label="Close"
      >
        ${unsafeSVG(X)}
        <span class="sr-only">Close</span>
      </button>
    `;
  }

  private handleClick = () => {
    this.dispatchEvent(
      new CustomEvent("content-close", {
        detail: { reason: "close-button" },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

// Register components in global type map
declare global {
  interface HTMLElementTagNameMap {
    "ui-dialog": Dialog;
    "ui-dialog-trigger": DialogTrigger;
    "ui-dialog-content": DialogContent;
    "ui-dialog-header": DialogHeader;
    "ui-dialog-title": DialogTitle;
    "ui-dialog-description": DialogDescription;
    "ui-dialog-footer": DialogFooter;
    "ui-dialog-close": DialogClose;
  }

  interface HTMLElementEventMap {
    "open-change": CustomEvent<{ open: boolean }>;
    "dialog-close": CustomEvent<DialogCloseEvent>;
  }
}
