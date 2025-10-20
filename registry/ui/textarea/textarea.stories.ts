import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type TextareaArgs = HTMLTextAreaElement & { children?: string };

const meta: Meta<TextareaArgs> = {
  title: "ui/Textarea",
  component: "textarea",
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text shown when empty",
    },
    disabled: {
      control: "boolean",
      description: "Whether textarea is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether textarea is required",
    },
    rows: {
      control: "number",
      description: "Number of visible text rows",
    },
    maxLength: {
      control: "number",
      description: "Maximum character length",
    },
  },
  args: {
    placeholder: "Type your message here.",
    disabled: false,
    required: false,
    rows: 3,
  },
  parameters: {
    layout: "centered",
  },
  render: (args) => html`
    <textarea
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      ?required=${args.required}
      rows=${args.rows || 3}
      maxlength=${args.maxLength}
      class="w-96"
    ></textarea>
  `,
};

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithLabel: Story = {
  render: (args) => html`
    <div class="grid w-full gap-3">
      <ui-label for="message">Your message</ui-label>
      <textarea
        id="message"
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        class="w-96"
      ></textarea>
    </div>
  `,
};

export const WithHelperText: Story = {
  render: (args) => html`
    <div class="grid w-full gap-3">
      <ui-label for="message-2">Your Message</ui-label>
      <textarea
        id="message-2"
        placeholder=${args.placeholder || ""}
        ?disabled=${args.disabled}
        class="w-96"
      ></textarea>
      <p class="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  `,
};

export const WithCustomRows: Story = {
  args: {
    rows: 10,
  },
};

export const WithMaxLength: Story = {
  args: {
    maxLength: 500,
    placeholder: "Max 500 characters...",
  },
};

export const NoResize: Story = {
  render: () => html`
    <textarea
      placeholder="Type your message here."
      class="w-96 resize-none"
    ></textarea>
  `,
};

export const CustomStyling: Story = {
  render: () => html`
    <textarea
      placeholder="Code here..."
      class="min-h-[200px] resize-none font-mono w-96"
    ></textarea>
  `,
};
