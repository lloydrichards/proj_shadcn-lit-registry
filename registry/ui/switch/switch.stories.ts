import "./switch";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { SwitchProperties } from "./switch";

type SwitchArgs = SwitchProperties & {
  label?: string;
};

/**
 * A control that allows the user to toggle between checked and not checked.
 */
const meta: Meta<SwitchArgs> = {
  title: "ui/Switch",
  component: "ui-switch",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    name: { control: "text" },
    value: { control: "text" },
    label: { control: "text" },
  },
  args: {
    disabled: false,
    required: false,
    defaultChecked: false,
    name: "",
    value: "on",
    label: "Airplane Mode",
  },
  render: (args) => html`
    <div class="flex items-center gap-2">
      <ui-switch
        id="switch"
        .disabled=${args.disabled || false}
        .required=${args.required || false}
        .checked=${args.checked}
        .defaultChecked=${args.defaultChecked || false}
        .name=${args.name || ""}
        .value=${args.value || "on"}
      ></ui-switch>
      <label for="switch" class="text-sm font-medium">${args.label}</label>
    </div>
  `,
};

export default meta;

type Story = StoryObj<SwitchArgs>;

/**
 * The default form of the switch.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the switch.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Switch with default checked state.
 */
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};
