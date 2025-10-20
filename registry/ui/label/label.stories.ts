import "../checkbox/checkbox";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type LabelArgs = Omit<HTMLLabelElement, "children"> & { children?: string };

const meta: Meta<LabelArgs> = {
  title: "ui/Label",
  component: "label",
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Label text content",
    },
  },
  args: {
    children: "Email",
  },
  parameters: {
    layout: "centered",
  },
  render: (args) => html` <label> ${args.children} </label> `,
};

export default meta;
type Story = StoryObj<LabelArgs>;

export const Default: Story = {};

export const WithInput: Story = {
  render: (args) => html`
    <div class="grid w-full gap-3">
      <label for="email">${args.children}</label>
      <input id="email" placeholder="Enter your email" class="w-96"></input>
    </div>
  `,
};

export const WithRequiredIndicator: Story = {
  render: (args) => html`
    <div class="grid w-full gap-3">
      <label for="email">
        ${args.children} <span class="text-destructive">*</span>
      </label>
      <input type="email" required class="w-96"></input>
    </div>
  `,
};

export const CustomStyling: Story = {
  render: (args) => html`
    <label class="text-base font-semibold"> ${args.children} </label>
  `,
  args: {
    children: "Important Field",
  },
};

export const WithHelperText: Story = {
  render: (args) => html`
    <div class="grid w-full gap-3">
      <label for="email">${args.children}</label>
      <input id="email" placeholder="Enter your email" class="w-96"></input>
      <p class="text-sm text-muted-foreground">We'll never share your email.</p>
    </div>
  `,
};

export const PeerDisabled: Story = {
  render: (args) => html`
    <div class="flex items-center gap-2">
      <ui-checkbox id="checkbox" class="peer" disabled checked></ui-checkbox>
      <label for="checkbox">${args.children}</label>
    </div>
  `,
  args: {
    children: "Disabled checkbox label",
  },
};
