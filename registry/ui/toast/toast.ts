import { cva, type VariantProps } from "class-variance-authority";
import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { X } from "lucide-static";
import { TW } from "@/lib/tailwindMixin";

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success:
          "group border-green-500 bg-green-50 text-green-900 dark:border-green-500/50 dark:bg-green-950 dark:text-green-100",
        warning:
          "group border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-500/50 dark:bg-yellow-950 dark:text-yellow-100",
        info: "group border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-500/50 dark:bg-blue-950 dark:text-blue-100",
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

export interface ToastOptions {
  description?: string;
  variant?: ToastVariants["variant"];
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

toast.success = (message: string, options: ToastOptions = {}) => {
  return toast(message, { ...options, variant: "success" });
};

toast.error = (message: string, options: ToastOptions = {}) => {
  return toast(message, { ...options, variant: "destructive" });
};

toast.warning = (message: string, options: ToastOptions = {}) => {
  return toast(message, { ...options, variant: "warning" });
};

toast.info = (message: string, options: ToastOptions = {}) => {
  return toast(message, { ...options, variant: "info" });
};

toast.promise = async <T>(
  promise: Promise<T>,
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
    variant: "default",
    duration: Number.POSITIVE_INFINITY,
  });

  try {
    const data = await promise;
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

  private renderToast(toast: ToastData) {
    return html`
      <div
        class=${toastVariants({ variant: toast.variant, state: toast.state })}
        role=${toast.variant === "destructive" ? "alert" : "status"}
        aria-live=${toast.variant === "destructive" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        <div class="grid gap-1">
          <div class="text-sm font-semibold [&+div]:text-xs">
            ${toast.message}
          </div>
          ${
            toast.description
              ? html`<div class="text-sm opacity-90">${toast.description}</div>`
              : nothing
          }
        </div>
        ${
          toast.action
            ? html`
              <button
                class="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
                @click=${() => {
                  toast.action?.onClick();
                  this.dismissToast(toast.id);
                }}
              >
                ${toast.action.label}
              </button>
            `
            : nothing
        }
        <button
          class="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-100 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 md:opacity-0 md:group-hover:opacity-100"
          @click=${() => this.dismissToast(toast.id)}
          aria-label="Close"
        >
          ${unsafeHTML(X)}
        </button>
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
