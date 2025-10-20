import "../button/button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type InputArgs = HTMLInputElement;

/**
 * Displays a form input field or a component that looks like an input field.
 */
const meta: Meta<InputArgs> = {
  title: "ui/Input",
  component: "input",
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    type: "email",
    placeholder: "Email",
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
  render: (args) =>
    html`<input
      type=${args.type as any}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      class="w-96"
    ></input>`,
};

export default meta;

type Story = StoryObj<InputArgs>;

/**
 * The default form of the input field.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to make the input non-interactive and appears faded,
 * indicating that input is not currently accepted.
 */
export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * Use the `Label` component to includes a clear, descriptive label above or
 * alongside the input area to guide users.
 */
export const WithLabel: Story = {
  render: (args) => html`
    <div class="grid gap-1.5">
      <label for="email" class="text-sm font-medium">
        ${args.placeholder}
      </label>
      <input
        id="email"
        type=${args.type as any}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        class="w-96"
      ></input>
    </div>
  `,
};

/**
 * Use a text element below the input field to provide additional instructions
 * or information to users.
 */
export const WithHelperText: Story = {
  render: (args) => html`
    <div class="grid gap-1.5">
      <label for="email-2" class="text-sm font-medium">
        ${args.placeholder}
      </label>
      <input
        id="email-2"
        type=${args.type as any}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        class="w-96"
      ></input>
      <p class="text-sm text-foreground/60">Enter your email address.</p>
    </div>
  `,
};

/**
 * Use the `Button` component to indicate that the input field can be submitted
 * or used to trigger an action.
 */
export const WithButton: Story = {
  render: (args) => html`
    <div class="flex items-center gap-2">
      <input
        type=${args.type as any}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        class="w-96"
      ></input>
      <ui-button type="submit">Subscribe</ui-button>
    </div>
  `,
};
