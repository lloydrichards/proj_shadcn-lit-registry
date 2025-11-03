import { cva, type VariantProps } from "class-variance-authority";
import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
  X,
} from "lucide-static";
import { TW } from "@/lib/tailwindMixin";
import "../button/button";

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground border",
        outline: "bg-background text-foreground border",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive",
      },
      state: {
        open: "animate-in fade-in-0 slide-in-from-top-full duration-300 sm:slide-in-from-bottom-full",
        closed: "animate-out fade-out-80 slide-out-to-right-full duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ToastVariants = VariantProps<typeof toastVariants>;

export type ToastType = "success" | "error" | "info" | "warning" | "loading";

export interface ToastOptions {
  description?: string;
  variant?: ToastVariants["variant"];
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

interface ToastData extends ToastOptions {
  id: string;
  message: string;
  state: "open" | "closed";
}

let toasterInstance: Toaster | null = null;
let toastIdCounter = 0;

function ensureToaster(): Toaster {
  if (!toasterInstance) {
    toasterInstance = document.createElement("ui-toaster") as Toaster;
    document.body.appendChild(toasterInstance);
  }
  return toasterInstance;
}

export function toast(message: string, options: ToastOptions = {}) {
  const toaster = ensureToaster();
  return toaster.addToast(message, options);
}

toast.success = (message: string, options: ToastOptions = {}) =>
  toast(message, { ...options, type: "success" });

toast.error = (message: string, options: ToastOptions = {}) =>
  toast(message, { ...options, type: "error" });

toast.warning = (message: string, options: ToastOptions = {}) =>
  toast(message, { ...options, type: "warning" });

toast.info = (message: string, options: ToastOptions = {}) =>
  toast(message, { ...options, type: "info" });

toast.promise = async <T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options: ToastOptions = {},
): Promise<T> => {
  const toaster = ensureToaster();
  const loadingToastId = toaster.addToast(messages.loading, {
    ...options,
    type: "loading",
    duration: Number.POSITIVE_INFINITY,
  });

  try {
    const data = await (typeof promise === "function" ? promise() : promise);
    toaster.dismissToast(loadingToastId);
    const successMessage =
      typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;
    toast.success(successMessage, options);
    return data;
  } catch (error) {
    toaster.dismissToast(loadingToastId);
    const errorMessage =
      typeof messages.error === "function"
        ? messages.error(error as Error)
        : messages.error;
    toast.error(errorMessage, options);
    throw error;
  }
};

@customElement("ui-toaster")
export class Toaster extends TW(LitElement) {
  @state() private toasts: ToastData[] = [];
  private maxToasts = 3;
  private timers = new Map<string, number>();
  private animationDuration = 300;
  private prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  disconnectedCallback() {
    super.disconnectedCallback();
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }

  addToast(message: string, options: ToastOptions = {}): string {
    const id = `toast-${++toastIdCounter}`;
    const duration = options.duration ?? 5000;

    const toast: ToastData = {
      id,
      message,
      state: "open",
      ...options,
    };

    this.toasts.push(toast);
    this.requestUpdate();

    if (this.toasts.length > this.maxToasts) {
      const oldestToast = this.toasts[0];
      this.dismissToast(oldestToast.id);
    }

    if (duration !== Number.POSITIVE_INFINITY) {
      const timerId = window.setTimeout(() => {
        this.dismissToast(id);
      }, duration);
      this.timers.set(id, timerId);
    }

    return id;
  }

  dismissToast(id: string) {
    const index = this.toasts.findIndex((t) => t.id === id);
    if (index === -1) return;

    const timerId = this.timers.get(id);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      this.timers.delete(id);
    }

    this.toasts[index].state = "closed";
    this.requestUpdate();

    const cleanupDelay = this.prefersReducedMotion ? 0 : this.animationDuration;
    setTimeout(() => {
      const toastIndex = this.toasts.findIndex((t) => t.id === id);
      if (toastIndex !== -1) {
        const toast = this.toasts[toastIndex];
        this.toasts.splice(toastIndex, 1);
        this.requestUpdate();
        toast?.onDismiss?.();
      }
    }, cleanupDelay);
  }

  private getIcon(type?: ToastType) {
    switch (type) {
      case "success":
        return CircleCheck;
      case "info":
        return Info;
      case "warning":
        return TriangleAlert;
      case "error":
        return OctagonX;
      case "loading":
        return LoaderCircle;
      default:
        return null;
    }
  }

  private renderToast(toast: ToastData) {
    const icon = this.getIcon(toast.type);

    return html`
      <div
        class=${toastVariants({ variant: toast.variant, state: toast.state })}
        role=${toast.type === "error" ? "alert" : "status"}
        aria-live=${toast.type === "error" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        ${icon
          ? html`<div
              class="[&>svg]:size-4 shrink-0 ${toast.type === "loading"
                ? "animate-spin"
                : ""}"
            >
              ${unsafeHTML(icon)}
            </div>`
          : nothing}
        <div class="grid gap-1 flex-1">
          <div class="text-sm font-semibold [&+div]:text-xs">
            ${toast.message}
          </div>
          ${toast.description
            ? html`<div class="text-sm opacity-90">${toast.description}</div>`
            : nothing}
        </div>
        ${toast.action
          ? html`
              <ui-button
                variant="outline"
                size="sm"
                @click=${() => {
                  toast.action?.onClick();
                  this.dismissToast(toast.id);
                }}
              >
                ${toast.action.label}
              </ui-button>
            `
          : nothing}
        <ui-button
          class="absolute right-1 top-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
          variant="ghost"
          size="icon-sm"
          @click=${() => this.dismissToast(toast.id)}
          aria-label="Close"
        >
          ${unsafeHTML(X)}
        </ui-button>
      </div>
    `;
  }

  override render() {
    return html`
      <div
        class="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
        aria-live="polite"
        aria-label="Notifications"
      >
        ${repeat(
          this.toasts,
          (toast) => toast.id,
          (toast) => this.renderToast(toast),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-toaster": Toaster;
  }
}
