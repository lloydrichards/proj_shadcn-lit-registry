# Dialog Component Migration Guide

## Component: ui-dialog (and sub-components)

**Priority**: HIGH  
**Complexity**: HIGH  
**Dependencies**: BaseElement, Context API, Focus Management

## Current Implementation Analysis

**File**: `registry/ui/dialog/dialog.ts`

**Current Issues**:

- Complex state management without context API
- Focus management incomplete (no focus trap)
- Animation handling could use animation utilities
- Missing proper ARIA attributes for screen readers
- Event bubbling between sub-components is fragile

## Migration Instructions

### Step 1: Create Dialog Context

```typescript
// registry/ui/dialog/dialog-context.ts
import { createComponentContext } from "@/registry/lib/context";

export interface DialogContext {
  open: boolean;
  modal: boolean;
  setOpen: (open: boolean, reason?: string) => void;
  titleId?: string;
  descriptionId?: string;
}

export const dialogContext = createComponentContext<DialogContext>("dialog");
```

### Step 2: Update Dialog Root Component

```typescript
// registry/ui/dialog/dialog.ts
import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { dialogContext, type DialogContext } from "./dialog-context";
import { DialogTrigger } from "./dialog-trigger";
import { DialogContent } from "./dialog-content";
import { DialogHeader } from "./dialog-header";
import { DialogFooter } from "./dialog-footer";
import { DialogTitle } from "./dialog-title";
import { DialogDescription } from "./dialog-description";
import { DialogClose } from "./dialog-close";

/**
 * @element ui-dialog
 * @slot - Dialog content (typically ui-dialog-content)
 * @fires dialog-open-change - When dialog open state changes
 * @fires dialog-close - When dialog closes with reason
 */
@customElement("ui-dialog")
export class Dialog extends BaseElement {
  static dependencies = {
    "ui-dialog-trigger": DialogTrigger,
    "ui-dialog-content": DialogContent,
    "ui-dialog-header": DialogHeader,
    "ui-dialog-footer": DialogFooter,
    "ui-dialog-title": DialogTitle,
    "ui-dialog-description": DialogDescription,
    "ui-dialog-close": DialogClose,
  };

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;

  @state() private titleId?: string;
  @state() private descriptionId?: string;

  static styles = css`
    :host {
      display: contents;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.updateContext();
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("open") || changedProperties.has("modal")) {
      this.updateContext();

      if (changedProperties.has("open")) {
        this.emit("dialog-open-change", { open: this.open });
      }
    }
  }

  private updateContext() {
    const context: DialogContext = {
      open: this.open,
      modal: this.modal,
      setOpen: (open: boolean, reason?: string) => this.setOpen(open, reason),
      titleId: this.titleId,
      descriptionId: this.descriptionId,
    };

    dialogContext.provide(this, context);
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
    this.updateContext();
  }

  setDescriptionId(id: string) {
    this.descriptionId = id;
    this.updateContext();
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
```

### Step 3: Update Dialog Content with Focus Management

```typescript
// registry/ui/dialog/dialog-content.ts
import { html, css, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { dialogContext, type DialogContext } from "./dialog-context";
import { cn, trapFocus, getFocusableElements } from "@/registry/lib/utils";
import {
  animations,
  waitForAnimation,
  prefersReducedMotion,
} from "@/registry/lib/animations";

/**
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
export class DialogContent extends BaseElement {
  private context?: DialogContext;
  private previousFocus?: HTMLElement;
  private cleanupFocusTrap?: () => void;

  @property({ type: Boolean }) closeOnEscape = true;
  @property({ type: Boolean }) closeOnBackdrop = true;
  @property({ type: Boolean }) preventScroll = true;

  @state() private isAnimating = false;
  @state() private animationState: "idle" | "entering" | "entered" | "exiting" =
    "idle";

  @query("dialog") private dialogElement!: HTMLDialogElement;

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

    /* Prevent body scroll when dialog is open */
    :host([data-open="true"]) {
      position: fixed;
      inset: 0;
      overflow: hidden;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.context = dialogContext.consume(this);

    // Set up global escape key handler
    document.addEventListener("keydown", this.handleGlobalKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleGlobalKeyDown);
    this.cleanupFocusTrap?.();

    // Restore scroll
    if (this.preventScroll) {
      document.body.style.overflow = "";
    }
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    // React to context changes
    if (this.context?.open && this.animationState === "idle") {
      this.openDialog();
    } else if (!this.context?.open && this.animationState === "entered") {
      this.closeDialog();
    }
  }

  render() {
    if (this.animationState === "idle" && !this.context?.open) {
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
        aria-modal=${this.context?.modal ? "true" : "false"}
        aria-labelledby=${this.context?.titleId || nothing}
        aria-describedby=${this.context?.descriptionId || nothing}
        data-state=${isOpen ? "open" : "closed"}
        class=${cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg",
          "translate-x-[-50%] translate-y-[-50%]",
          "gap-4 border bg-background p-6 shadow-lg",
          "duration-200 sm:rounded-lg",
          !prefersReducedMotion() && isOpen && animations.dialogShow,
          !prefersReducedMotion() && !isOpen && animations.dialogHide,
          this.className
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
          "disabled:pointer-events-none"
        )}
        aria-label="Close dialog"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.7816 3.21751C11.9062 3.34195 11.9062 3.54305 11.7816 3.66749L8.16749 7.28161C8.04305 7.40605 8.04305 7.60715 8.16749 7.73159L11.7816 11.3457C11.9062 11.4702 11.9062 11.6713 11.7816 11.7958C11.6571 11.9202 11.456 11.9202 11.3316 11.7958L7.71749 8.18161C7.59305 8.05717 7.39195 8.05717 7.26751 8.18161L3.6534 11.7957C3.52896 11.9201 3.32786 11.9201 3.20342 11.7957C3.07898 11.6712 3.07898 11.4701 3.20342 11.3457L6.81753 7.73159C6.94197 7.60715 6.94197 7.40605 6.81753 7.28161L3.20342 3.66749C3.07898 3.54305 3.07898 3.34195 3.20342 3.21751C3.32786 3.09307 3.52896 3.09307 3.6534 3.21751L7.26751 6.83162C7.39195 6.95606 7.59305 6.95606 7.71749 6.83162L11.3316 3.21751C11.456 3.09307 11.6571 3.09307 11.7816 3.21751Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="sr-only">Close</span>
      </button>
    `;
  }

  private async openDialog() {
    this.animationState = "entering";
    this.isAnimating = true;

    // Store previous focus
    this.previousFocus = document.activeElement as HTMLElement;

    // Prevent body scroll
    if (this.preventScroll) {
      document.body.style.overflow = "hidden";
    }

    await this.updateComplete;

    // Show dialog
    if (this.dialogElement) {
      if (this.context?.modal) {
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
      this.isAnimating = false;

      this.emit("dialog-open");
    }
  }

  private async closeDialog() {
    this.animationState = "exiting";
    this.isAnimating = true;

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
    this.isAnimating = false;

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
    const event = this.emit("dialog-dismiss", { reason }, { cancelable: true });

    if (!event.defaultPrevented) {
      this.context?.setOpen(false, reason);
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
    if (e.key === "Escape" && this.context?.open && this.closeOnEscape) {
      e.preventDefault();
      this.dismiss("escape");
    }
  };
}
```

### Step 4: Update Other Dialog Sub-components

```typescript
// registry/ui/dialog/dialog-trigger.ts
@customElement("ui-dialog-trigger")
export class DialogTrigger extends BaseElement {
  private context?: DialogContext;

  @property({ type: Boolean }) disabled = false;

  static styles = css`
    :host {
      display: contents;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.context = dialogContext.consume(this);
  }

  render() {
    return html`
      <button
        part="trigger"
        type="button"
        @click=${this.handleClick}
        ?disabled=${this.disabled}
        aria-haspopup="dialog"
        aria-expanded=${this.context?.open ? "true" : "false"}
        class=${cn("inline-flex items-center justify-center", this.className)}
      >
        <slot></slot>
      </button>
    `;
  }

  private handleClick = () => {
    if (!this.disabled) {
      this.context?.setOpen(!this.context.open, "trigger");
    }
  };
}

// registry/ui/dialog/dialog-title.ts
@customElement("ui-dialog-title")
export class DialogTitle extends BaseElement {
  private dialog?: Dialog;

  @property({ type: String }) id =
    `dialog-title-${Math.random().toString(36).substring(2, 11)}`;

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
          this.className
        )}
      >
        <slot></slot>
      </h2>
    `;
  }
}

// Similar updates for DialogDescription, DialogHeader, DialogFooter, DialogClose
```

## Migration Checklist

### Architecture

- [ ] Context API implemented for state sharing
- [ ] All sub-components use context instead of events
- [ ] Dependencies auto-register in static property
- [ ] Clean separation of concerns between components

### Dialog Behavior

- [ ] Modal and non-modal modes work
- [ ] Open/close animations using Tailwind classes
- [ ] Backdrop click dismissal (optional)
- [ ] Escape key dismissal (optional)
- [ ] Prevent body scroll when open
- [ ] Restore scroll on close

### Focus Management

- [ ] Focus trapped within dialog when open
- [ ] Focus returns to trigger on close
- [ ] First focusable element focused on open
- [ ] Autofocus attribute respected
- [ ] Tab key cycles through focusable elements

### Accessibility

- [ ] role="dialog" on dialog element
- [ ] aria-modal for modal dialogs
- [ ] aria-labelledby points to title
- [ ] aria-describedby points to description
- [ ] Escape key handled properly
- [ ] Screen reader announcements work

### Events

- [ ] dialog-open-change event fired
- [ ] dialog-close event with reason
- [ ] dialog-dismiss cancelable event
- [ ] All events use composed: true

### Animation

- [ ] Open animation works
- [ ] Close animation works
- [ ] Respects prefers-reduced-motion
- [ ] No animation jumps or glitches

### Testing

- [ ] Dialog opens and closes properly
- [ ] Focus management works correctly
- [ ] Keyboard navigation works
- [ ] Backdrop click works
- [ ] Escape key works
- [ ] Nested dialogs work (if supported)
- [ ] Form elements inside dialog work
- [ ] Long content scrolls properly

## Common Issues & Fixes

### Issue: Focus not trapped

**Fix**: Ensure trapFocus is called after dialog opens

### Issue: Body still scrolls

**Fix**: Check preventScroll prop and overflow styles

### Issue: Animation jumpy

**Fix**: Use waitForAnimation and proper state management

### Issue: Context not updating

**Fix**: Ensure subscribe: true in consume() call

### Issue: Dialog not centered

**Fix**: Check Tailwind classes for positioning

## References

- [Context API](./05-base-infrastructure-implementation.md#task-5-create-context-utilities)
- [Focus utilities](./05-base-infrastructure-implementation.md#task-8-update-utils-file)
- [Animation utilities](./05-base-infrastructure-implementation.md#task-7-create-animation-utilities)
- [ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
