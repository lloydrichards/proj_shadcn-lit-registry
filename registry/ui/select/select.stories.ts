import "./select";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { SelectProperties } from "./select";

type SelectArgs = SelectProperties & {
  placeholder?: string;
};

/**
 * Displays a list of options for the user to pick from—triggered by a button.
 */
const meta: Meta<SelectArgs> = {
  title: "ui/Select",
  component: "ui-select",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    open: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    value: "",
    disabled: false,
    required: false,
    open: false,
    placeholder: "Select a fruit",
  },
  render: (args) => html`
    <ui-select
      class="w-96"
      .value=${args.value || ""}
      .disabled=${args.disabled || false}
      .required=${args.required || false}
      .open=${args.open || false}
    >
      <ui-select-trigger slot="trigger">
        <ui-select-value
          placeholder=${args.placeholder || ""}
        ></ui-select-value>
      </ui-select-trigger>
      <ui-select-content slot="content">
        <ui-select-group>
          <ui-select-label>Fruits</ui-select-label>
          <ui-select-item value="apple">Apple</ui-select-item>
          <ui-select-item value="banana">Banana</ui-select-item>
          <ui-select-item value="blueberry">Blueberry</ui-select-item>
          <ui-select-item value="grapes">Grapes</ui-select-item>
          <ui-select-item value="pineapple">Pineapple</ui-select-item>
        </ui-select-group>
        <ui-select-separator></ui-select-separator>
        <ui-select-group>
          <ui-select-label>Vegetables</ui-select-label>
          <ui-select-item value="aubergine">Aubergine</ui-select-item>
          <ui-select-item value="broccoli">Broccoli</ui-select-item>
          <ui-select-item value="carrot" .disabled=${true}
            >Carrot</ui-select-item
          >
          <ui-select-item value="courgette">Courgette</ui-select-item>
          <ui-select-item value="leek">Leek</ui-select-item>
        </ui-select-group>
        <ui-select-separator></ui-select-separator>
        <ui-select-group>
          <ui-select-label>Meat</ui-select-label>
          <ui-select-item value="beef">Beef</ui-select-item>
          <ui-select-item value="chicken">Chicken</ui-select-item>
          <ui-select-item value="lamb">Lamb</ui-select-item>
          <ui-select-item value="pork">Pork</ui-select-item>
        </ui-select-group>
      </ui-select-content>
    </ui-select>
  `,
};

export default meta;

type Story = StoryObj<SelectArgs>;

/**
 * The default form of the select.
 */
export const Default: Story = {};
