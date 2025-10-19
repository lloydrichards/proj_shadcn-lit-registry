import "./toast";
import "../button/button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { toast } from "./toast";

/**
 * An opinionated toast component for displaying notifications.
 */
const meta: Meta = {
  title: "ui/Toast",
  component: "ui-toaster",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj;

/**
 * The default form of the toast.
 */
export const Default: Story = {
  render: () => {
    const handleClick = () => {
      toast("Event has been created", {
        description: new Date().toLocaleString(),
        action: {
          label: "Undo",
          onClick: () => console.log("Undo clicked"),
        },
      });
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Toast</ui-button>
        <ui-toaster></ui-toaster>
      </div>
    `;
  },
};

/**
 * Success toast variant.
 */
export const Success: Story = {
  render: () => {
    const handleClick = () => {
      toast.success("Operation completed successfully", {
        description: "Your changes have been saved.",
      });
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Success Toast</ui-button>
        <ui-toaster></ui-toaster>
      </div>
    `;
  },
};

/**
 * Error toast variant.
 */
export const Error: Story = {
  render: () => {
    const handleClick = () => {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Error Toast</ui-button>
        <ui-toaster></ui-toaster>
      </div>
    `;
  },
};

/**
 * Warning toast variant.
 */
export const Warning: Story = {
  render: () => {
    const handleClick = () => {
      toast.warning("Be careful", {
        description: "This action cannot be undone.",
      });
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Warning Toast</ui-button>
        <ui-toaster></ui-toaster>
      </div>
    `;
  },
};

/**
 * Info toast variant.
 */
export const Info: Story = {
  render: () => {
    const handleClick = () => {
      toast.info("New update available", {
        description: "Version 2.0 is ready to install.",
      });
    };

    return html`
      <div class="flex min-h-96 items-center justify-center gap-2">
        <ui-button @click=${handleClick}>Show Info Toast</ui-button>
        <ui-toaster></ui-toaster>
      </div>
    `;
  },
};
