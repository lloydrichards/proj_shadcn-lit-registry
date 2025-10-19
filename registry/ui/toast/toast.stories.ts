import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../button/button";
import "./toast";
import { type ToastOptions, type ToastType, toast } from "./toast";

type ToastArgs = {
  message: string;
  description?: string;
  type?: ToastType;
  variant?: ToastOptions["variant"];
  showAction?: boolean;
  actionLabel?: string;
  duration?: number;
};

/**
 * An opinionated toast component for displaying notifications.
 */
const meta: Meta<ToastArgs> = {
  title: "ui/Toast",
  component: "ui-toaster",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    message: {
      control: "text",
      description: "The main message of the toast",
    },
    description: {
      control: "text",
      description: "Optional description text",
    },
    type: {
      control: "select",
      options: [undefined, "success", "error", "info", "warning", "loading"],
      description: "Toast notification type (controls icon)",
    },
    variant: {
      control: "select",
      options: ["default", "outline", "destructive"],
      description: "Visual style variant",
    },
    showAction: {
      control: "boolean",
      description: "Show action button",
    },
    actionLabel: {
      control: "text",
      description: "Action button label",
      if: { arg: "showAction", eq: true },
    },
    duration: {
      control: "number",
      description: "Duration in milliseconds (0 = infinite)",
    },
  },
  args: {
    message: "Event has been created",
    description: "",
    variant: "default",
    showAction: false,
    actionLabel: "Undo",
    duration: 5000,
  },
  render: (args) => {
    const handleClick = () => {
      const options: ToastOptions = {
        variant: args.variant,
        type: args.type,
        duration: args.duration || undefined,
      };

      if (args.description) {
        options.description = args.description;
      }

      if (args.showAction && args.actionLabel) {
        options.action = {
          label: args.actionLabel,
          onClick: () => console.log("Action clicked"),
        };
      }

      toast(args.message, options);
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Toast</ui-button>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<ToastArgs>;

/**
 * The default form of the toast.
 */
export const Default: Story = {};

/**
 * Success toast type with icon.
 */
export const Success: Story = {
  args: {
    message: "Operation completed successfully",
    description: "Your changes have been saved.",
    type: "success",
  },
};

/**
 * Error toast type with icon.
 */
export const Error: Story = {
  args: {
    message: "Something went wrong",
    description: "Please try again later.",
    type: "error",
  },
};

/**
 * Warning toast type with icon.
 */
export const Warning: Story = {
  args: {
    message: "Be careful",
    description: "This action cannot be undone.",
    type: "warning",
  },
};

/**
 * Info toast type with icon.
 */
export const Info: Story = {
  args: {
    message: "Be at the area 10 minutes before the event time",
    type: "info",
  },
};

/**
 * Promise toast with loading, success, and error states.
 */
export const PromiseToast: Story = {
  render: () => {
    const handleClick = () => {
      toast.promise<{ name: string }>(
        () =>
          new globalThis.Promise((resolve) =>
            setTimeout(() => resolve({ name: "Event" }), 2000),
          ),
        {
          loading: "Loading...",
          success: (data) => `${data.name} has been created`,
          error: "Error",
        },
      );
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Promise Toast</ui-button>
      </div>
    `;
  },
};

/**
 * All toast types in one demo.
 */
export const AllTypes: Story = {
  render: () => {
    return html`
      <div class="flex min-h-96 flex-wrap items-center justify-center gap-2">
        <ui-button
          variant="outline"
          @click=${() => toast("Event has been created")}
        >
          Default
        </ui-button>
        <ui-button
          variant="outline"
          @click=${() => toast.success("Event has been created")}
        >
          Success
        </ui-button>
        <ui-button
          variant="outline"
          @click=${() =>
            toast.info("Be at the area 10 minutes before the event time")}
        >
          Info
        </ui-button>
        <ui-button
          variant="outline"
          @click=${() =>
            toast.warning("Event start time cannot be earlier than 8am")}
        >
          Warning
        </ui-button>
        <ui-button
          variant="outline"
          @click=${() => toast.error("Event has not been created")}
        >
          Error
        </ui-button>
        <ui-button
          variant="outline"
          @click=${() =>
            toast.promise<{ name: string }>(
              () =>
                new globalThis.Promise((resolve) =>
                  setTimeout(() => resolve({ name: "Event" }), 2000),
                ),
              {
                loading: "Loading...",
                success: (data) => `${data.name} has been created`,
                error: "Error",
              },
            )}
        >
          Promise
        </ui-button>
      </div>
    `;
  },
};

/**
 * Toast with outline variant styling.
 */
export const OutlineVariant: Story = {
  args: {
    message: "Operation completed",
    description: "Your changes have been saved.",
    type: "success",
    variant: "outline",
  },
};

/**
 * Toast with destructive variant styling.
 */
export const DestructiveVariant: Story = {
  args: {
    message: "Critical error",
    description: "This action cannot be undone.",
    type: "error",
    variant: "destructive",
  },
};

/**
 * Toast with action button.
 */
export const WithAction: Story = {
  args: {
    message: "Event has been created",
    description: new Date().toLocaleString(),
    showAction: true,
    actionLabel: "Undo",
  },
};

/**
 * Loading toast type with spinning icon.
 */
export const Loading: Story = {
  args: {
    message: "Loading...",
    description: "Please wait while we process your request.",
    type: "loading",
    duration: 0,
  },
};
