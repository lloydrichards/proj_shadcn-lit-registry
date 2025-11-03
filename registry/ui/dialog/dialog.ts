import { css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { provide, consume, createContext } from "@lit/context";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { X } from "lucide-static";
import { BaseElement } from "@/registry/lib/base-element";
import { cn, trapFocus, getFocusableElements, uid } from "@/registry/lib/utils";
import {
  animations,
  waitForAnimation,
  prefersReducedMotion,
} from "@/registry/lib/animations";

/**
 * Dialog Context
 *
 * Shares state between dialog root and child components using @lit/context
 */
export type DialogContext = {
  open: boolean;
  modal: boolean;
  setOpen: (open: boolean, reason?: string) => void;
  titleId?: string;
  descriptionId?: string;
};
/**
 * Context for sharing dialog state between components
 * Used by ui-dialog (provider) and child components (consumers)
 */

export const dialogContext = createContext<DialogContext>(Symbol("dialog"));

/**
 * Dialog component properties
 */
export type DialogProperties = {
  open?: boolean;
  modal?: boolean;
};

export type DialogTriggerProperties = {
  disabled?: boolean;
};

export type DialogContentProperties = {
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  preventScroll?: boolean;
};

export type DialogCloseEvent = {
  reason: "escape" | "backdrop" | "close-button" | "programmatic";
};

export type DialogOpenChangeEvent = CustomEvent & {
  detail: { open: boolean };
};

/**
 * Root dialog container managing state
 *
 * @element ui-dialog
 * @slot - Dialog content (typically ui-dialog-trigger and ui-dialog-content)
 * @fires dialog-open-change - When dialog open state changes
 * @fires dialog-close - When dialog closes with reason
 */
@customElement("ui-dialog")
export class Dialog extends BaseElement implements DialogProperties {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @provide({ context: dialogContext })
  @state()
  _context!: DialogContext;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;

  @state() private titleId?: string;
  @state() private descriptionId?: string;

  override willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    super.willUpdate(changedProperties);

    // Update context when relevant properties change
    if (
      changedProperties.has("open") ||
      changedProperties.has("modal") ||
      changedProperties.has("titleId") ||
      changedProperties.has("descriptionId") ||
      !this._context
    ) {
      this._context = {
        open: this.open,
        modal: this.modal,
        setOpen: (open: boolean, reason?: string) => this.setOpen(open, reason),
        titleId: this.titleId,
        descriptionId: this.descriptionId,
      };
    }

    // Emit public event
    if (changedProperties.has("open")) {
      this.emit("dialog-open-change", { open: this.open });
    }
  }

  private setOpen(open: boolean, reason = "programmatic") {
    const oldOpen = this.open;
    this.open = open;

    if (!open && oldOpen) {
      this.emit("dialog-close", { reason });
    }
  }

  setTitleId(id: string) {
    this.titleId = id;
  }

  setDescriptionId(id: string) {
    this.descriptionId = id;
  }

  render() {
    return html`<slot></slot>`;
  }

  // Public API
  showModal() {
    this.modal = true;
    this.open = true;
  }

  show() {
    this.modal = false;
    this.open = true;
  }

  close(reason = "programmatic") {
    this.setOpen(false, reason);
  }
}

/**
 * Dialog trigger button
 *
 * @element ui-dialog-trigger
 * @slot - Trigger content (typically a button)
 */
@customElement("ui-dialog-trigger")
export class DialogTrigger
  extends BaseElement
  implements DialogTriggerProperties
{
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @consume({ context: dialogContext, subscribe: true })
  @property({ attribute: false })
  private _dialogContext?: DialogContext;

  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button
        part="trigger"
        type="button"
        @click=${this.handleClick}
        ?disabled=${this.disabled}
        aria-haspopup="dialog"
        aria-expanded=${this._dialogContext?.open ? "true" : "false"}
        class=${cn("inline-flex items-center justify-center", this.className)}
      >
        <slot></slot>
      </button>
    `;
  }

  private handleClick = () => {
    if (!this.disabled && this._dialogContext) {
      this._dialogContext.setOpen(!this._dialogContext.open, "trigger");
    }
  };
}

/**
 * Dialog content with native dialog element
 *
 * @element ui-dialog-content
 * @slot - Dialog content
 * @csspart backdrop - The backdrop overlay
 * @csspart dialog - The dialog element
 * @csspart content - The content wrapper
 * @fires dialog-open - When dialog opens
 * @fires dialog-close - When dialog closes
 * @fires dialog-dismiss - When user attempts to dismiss
 */
@customElement("ui-dialog-content")
export class DialogContent
  extends BaseElement
  implements DialogContentProperties
{
  static styles = css`
    :host {
      display: contents;
    }

    dialog {
      padding: 0;
      border: none;
      background: transparent;
      max-width: 100vw;
      max-height: 100vh;
    }

    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.8);
    }
  `;

  @consume({ context: dialogContext, subscribe: true })
  @property({ attribute: false })
  private _dialogContext?: DialogContext;

  @property({ type: Boolean }) closeOnEscape = true;
  @property({ type: Boolean }) closeOnBackdrop = true;
  @property({ type: Boolean }) preventScroll = true;

  @state() private animationState: "idle" | "entering" | "entered" | "exiting" =
    "idle";

  @state() private _previousOpen?: boolean;

  @query("dialog") private dialogElement!: HTMLDialogElement;

  private previousFocus?: HTMLElement;
  private cleanupFocusTrap?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleGlobalKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleGlobalKeyDown);
    this.cleanupFocusTrap?.();

    if (this.preventScroll) {
      document.body.style.overflow = "";
    }
  }

  override willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    super.willUpdate(changedProperties);

    // Derive animation state from context.open
    const contextOpen = this._dialogContext?.open;

    // Trigger state update if context changed or dialog open state changed
    if (
      changedProperties.has("_dialogContext") ||
      this._previousOpen !== contextOpen
    ) {
      this._previousOpen = contextOpen;

      if (contextOpen && this.animationState === "idle") {
        this.animationState = "entering";
      } else if (!contextOpen && this.animationState === "entered") {
        this.animationState = "exiting";
      }
    }
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    // Schedule async operations AFTER render completes
    if (changedProperties.has("animationState")) {
      if (this.animationState === "entering") {
        this.updateComplete.then(() => this.performOpenDialog());
      } else if (this.animationState === "exiting") {
        this.updateComplete.then(() => this.performCloseDialog());
      }
    }
  }

  render() {
    if (this.animationState === "idle" && !this._dialogContext?.open) {
      return nothing;
    }

    const isOpen =
      this.animationState === "entering" || this.animationState === "entered";

    return html`
      <dialog
        part="dialog"
        ?open=${false}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        aria-modal=${this._dialogContext?.modal ? "true" : "false"}
        aria-labelledby=${this._dialogContext?.titleId || nothing}
        aria-describedby=${this._dialogContext?.descriptionId || nothing}
        data-state=${isOpen ? "open" : "closed"}
        class=${cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg",
          "translate-x-[-50%] translate-y-[-50%]",
          "gap-4 border bg-background p-6 shadow-lg",
          "duration-200 sm:rounded-lg",
          !prefersReducedMotion() && isOpen && animations.dialogShow,
          !prefersReducedMotion() && !isOpen && animations.dialogHide,
          this.className,
        )}
      >
        <div part="content" role="document">
          <slot></slot>
          ${this.renderCloseButton()}
        </div>
      </dialog>
    `;
  }

  private renderCloseButton() {
    return html`
      <button
        part="close-button"
        @click=${() => this.dismiss("close-button")}
        class=${cn(
          "absolute right-4 top-4 rounded-sm opacity-70",
          "ring-offset-background transition-opacity",
          "hover:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:pointer-events-none",
        )}
        aria-label="Close dialog"
      >
        ${unsafeSVG(X)}
        <span class="sr-only">Close</span>
      </button>
    `;
  }

  private async performOpenDialog() {
    // Store previous focus
    this.previousFocus = document.activeElement as HTMLElement;

    // Prevent body scroll
    if (this.preventScroll) {
      document.body.style.overflow = "hidden";
    }

    await this.updateComplete;

    // Show dialog
    if (this.dialogElement) {
      if (this._dialogContext?.modal) {
        this.dialogElement.showModal();
      } else {
        this.dialogElement.show();
      }

      // Focus first focusable element or dialog itself
      this.focusFirstElement();

      // Set up focus trap
      this.cleanupFocusTrap = trapFocus(this.dialogElement);

      // Wait for animation
      await waitForAnimation(this.dialogElement);

      this.animationState = "entered";

      this.emit("dialog-open");
    }
  }

  private async performCloseDialog() {
    // Clean up focus trap
    this.cleanupFocusTrap?.();

    // Wait for exit animation
    if (this.dialogElement) {
      await waitForAnimation(this.dialogElement);
    }

    // Close dialog element
    this.dialogElement?.close();

    // Restore focus
    this.previousFocus?.focus();

    // Restore scroll
    if (this.preventScroll) {
      document.body.style.overflow = "";
    }

    this.animationState = "idle";

    this.emit("dialog-close");
  }

  private focusFirstElement() {
    // Check for autofocus element
    const autofocus =
      this.dialogElement?.querySelector<HTMLElement>("[autofocus]");
    if (autofocus) {
      autofocus.focus();
      return;
    }

    // Focus first focusable element
    const focusable = getFocusableElements(this.dialogElement);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      // Focus dialog itself as fallback
      this.dialogElement?.focus();
    }
  }

  private dismiss(reason: string) {
    // Check if dismissal is allowed
    const eventNotCancelled = this.emit(
      "dialog-dismiss",
      { reason },
      { cancelable: true },
    );

    if (eventNotCancelled) {
      this._dialogContext?.setOpen(false, reason);
    }
  }

  private handleCancel = (e: Event) => {
    e.preventDefault();
    if (this.closeOnEscape) {
      this.dismiss("escape");
    }
  };

  private handleDialogClick = (e: MouseEvent) => {
    // Check if click is on backdrop (dialog element itself)
    if (e.target === this.dialogElement && this.closeOnBackdrop) {
      this.dismiss("backdrop");
    }
  };

  private handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this._dialogContext?.open && this.closeOnEscape) {
      e.preventDefault();
      this.dismiss("escape");
    }
  };
}

/**
 * Dialog header container
 *
 * @element ui-dialog-header
 * @slot - Header content (typically ui-dialog-title and ui-dialog-description)
 */
@customElement("ui-dialog-header")
export class DialogHeader extends BaseElement {
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
 *
 * @element ui-dialog-title
 * @slot - Title text
 */
@customElement("ui-dialog-title")
export class DialogTitle extends BaseElement {
  @property({ type: String }) id = `dialog-title-${uid()}`;

  private dialog?: Dialog;

  override connectedCallback() {
    super.connectedCallback();

    // Register with parent dialog
    this.dialog = this.closest("ui-dialog") as Dialog;
    if (this.dialog) {
      this.dialog.setTitleId(this.id);
    }
  }

  render() {
    return html`
      <h2
        id=${this.id}
        part="title"
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
 *
 * @element ui-dialog-description
 * @slot - Description text
 */
@customElement("ui-dialog-description")
export class DialogDescription extends BaseElement {
  @property({ type: String }) id = `dialog-desc-${uid()}`;

  private dialog?: Dialog;

  override connectedCallback() {
    super.connectedCallback();

    // Register with parent dialog
    this.dialog = this.closest("ui-dialog") as Dialog;
    if (this.dialog) {
      this.dialog.setDescriptionId(this.id);
    }
  }

  render() {
    return html`
      <p
        id=${this.id}
        part="description"
        class=${cn("text-sm text-muted-foreground", this.className)}
      >
        <slot></slot>
      </p>
    `;
  }
}

/**
 * Dialog footer container
 *
 * @element ui-dialog-footer
 * @slot - Footer content (typically buttons)
 */
@customElement("ui-dialog-footer")
export class DialogFooter extends BaseElement {
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
 *
 * @element ui-dialog-close
 * @slot - Close button content (optional, defaults to X icon)
 */
@customElement("ui-dialog-close")
export class DialogClose extends BaseElement {
  @consume({ context: dialogContext, subscribe: true })
  @property({ attribute: false })
  private _dialogContext?: DialogContext;

  render() {
    return html`
      <button
        type="button"
        part="close-button"
        class=${cn(
          "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
          "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:pointer-events-none",
          this.className,
        )}
        @click=${this.handleClick}
        aria-label="Close"
      >
        <slot>${unsafeSVG(X)}</slot>
        <span class="sr-only">Close</span>
      </button>
    `;
  }

  private handleClick = () => {
    this._dialogContext?.setOpen(false, "close-button");
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
    "dialog-open-change": DialogOpenChangeEvent;
    "dialog-close": CustomEvent<DialogCloseEvent>;
  }
}
