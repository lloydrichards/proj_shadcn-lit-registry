import "./checkbox";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CheckboxProperties } from "./checkbox";

type CheckboxArgs = CheckboxProperties;

const meta: Meta<CheckboxArgs> = {
  title: "ui/Checkbox",
  component: "ui-checkbox",
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Controlled checked state",
    },
    defaultChecked: {
      control: "boolean",
      description: "Initial checked state for uncontrolled mode",
    },
    indeterminate: {
      control: "boolean",
      description: "Indeterminate state (partial selection)",
    },
    disabled: {
      control: "boolean",
      description: "Whether checkbox is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether checkbox is required",
    },
  },
  args: {
    disabled: false,
    required: false,
    indeterminate: false,
  },
  parameters: {
    layout: "centered",
  },
  render: (args) => html`
    <ui-checkbox
      ?checked=${args.checked}
      ?default-checked=${args.defaultChecked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></ui-checkbox>
  `,
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const WithLabel: Story = {
  render: (args) => html`
    <div class="flex items-center gap-3">
      <ui-checkbox
        id="terms"
        ?disabled=${args.disabled}
        aria-label="Accept terms and conditions"
      ></ui-checkbox>
      <label class="ui-label" for="terms">Accept terms and conditions</label>
    </div>
  `,
};

export const WithLabelAndDescription: Story = {
  render: (args) => html`
    <div class="flex items-start gap-3">
      <ui-checkbox
        id="marketing"
        ?disabled=${args.disabled}
        aria-label="Marketing emails"
      ></ui-checkbox>
      <div class="grid gap-1.5 leading-none">
        <label class="ui-label font-medium" for="marketing"
          >Marketing emails</label
        >
        <p class="text-sm text-muted-foreground">
          Receive emails about new products, features, and more.
        </p>
      </div>
    </div>
  `,
};

export const MultipleCheckboxes: Story = {
  render: () => html`
    <div class="grid gap-4">
      <div class="flex items-center gap-3">
        <ui-checkbox
          id="item-1"
          aria-label="Item 1"
          default-checked
        ></ui-checkbox>
        <label class="ui-label" for="item-1">Item 1</label>
      </div>
      <div class="flex items-center gap-3">
        <ui-checkbox id="item-2" aria-label="Item 2"></ui-checkbox>
        <label class="ui-label" for="item-2">Item 2</label>
      </div>
      <div class="flex items-center gap-3">
        <ui-checkbox id="item-3" aria-label="Item 3"></ui-checkbox>
        <label class="ui-label" for="item-3">Item 3</label>
      </div>
    </div>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        console.log("Form submitted:", Object.fromEntries(formData));
      }}
      class="grid gap-4"
    >
      <div class="flex items-center gap-3">
        <ui-checkbox
          name="subscribe"
          value="yes"
          aria-label="Subscribe to newsletter"
        ></ui-checkbox>
        <label class="ui-label" for="subscribe">Subscribe to newsletter</label>
      </div>
      <button
        type="submit"
        class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Submit
      </button>
    </form>
  `,
};
