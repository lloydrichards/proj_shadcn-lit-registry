import "./dialog";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { DialogProperties } from "./dialog";

type DialogArgs = DialogProperties & {
  triggerText?: string;
  titleText?: string;
  descriptionText?: string;
  cancelText?: string;
  continueText?: string;
};

/**
 * A window overlaid on either the primary window or another dialog window,
 * rendering the content underneath inert.
 */
const meta: Meta<DialogArgs> = {
  title: "ui/Dialog",
  component: "ui-dialog",
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controls whether the dialog is open or closed",
    },
    modal: {
      control: "boolean",
      description:
        "Whether the dialog is modal (blocks interaction with background)",
    },
    triggerText: {
      control: "text",
      description: "Text for the trigger button",
    },
    titleText: {
      control: "text",
      description: "Text for the dialog title",
    },
    descriptionText: {
      control: "text",
      description: "Text for the dialog description",
    },
    cancelText: {
      control: "text",
      description: "Text for the cancel button",
    },
    continueText: {
      control: "text",
      description: "Text for the continue button",
    },
  },
  args: {
    open: false,
    modal: true,
    triggerText: "Open",
    titleText: "Are you absolutely sure?",
    descriptionText:
      "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
    cancelText: "Cancel",
    continueText: "Continue",
  },
  render: (args) => html`
    <ui-dialog .open=${args.open || false} .modal=${args.modal || false}>
      <ui-dialog-trigger slot="trigger">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          ${args.triggerText}
        </button>
      </ui-dialog-trigger>
      <ui-dialog-content slot="content">
        <ui-dialog-header>
          <ui-dialog-title>${args.titleText}</ui-dialog-title>
          <ui-dialog-description>
            ${args.descriptionText}
          </ui-dialog-description>
        </ui-dialog-header>
        <ui-dialog-footer class="gap-4">
          <button
            type="button"
            class="hover:underline"
            @click=${(e: Event) => {
              const dialog = (e.target as HTMLElement).closest("ui-dialog");
              if (dialog) dialog.open = false;
            }}
          >
            ${args.cancelText}
          </button>
          <button
            type="button"
            class="bg-primary text-primary-foreground rounded px-4 py-2"
            @click=${(e: Event) => {
              const dialog = (e.target as HTMLElement).closest("ui-dialog");
              if (dialog) dialog.open = false;
            }}
          >
            ${args.continueText}
          </button>
        </ui-dialog-footer>
      </ui-dialog-content>
    </ui-dialog>
  `,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<DialogArgs>;

/**
 * The default form of the dialog.
 */
export const Default: Story = {};

/**
 * Dialog that starts in an open state.
 */
export const Open: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    open: true,
  },
};

/**
 * Non-modal dialog that allows interaction with the background.
 */
export const NonModal: Story = {
  args: {
    modal: false,
  },
};
