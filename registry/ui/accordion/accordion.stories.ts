import "./accordion";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { AccordionProperties } from "./accordion";

type AccordionArgs = AccordionProperties;

/**
 * A vertically stacked set of interactive headings that each reveal a section
 * of content.
 */
const meta: Meta<AccordionArgs> = {
  title: "ui/Accordion",
  component: "ui-accordion",
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      description: "Type of accordion behavior",
      options: ["single", "multiple"],
    },
    collapsible: {
      control: "boolean",
      description: "Can an open accordion be collapsed using the trigger",
    },
    disabled: {
      control: "boolean",
    },
    value: {
      control: "text",
      description: "Controlled value (single mode only)",
    },
    defaultValue: {
      control: "text",
      description: "Default open item value",
    },
  },
  args: {
    type: "single",
    collapsible: true,
    disabled: false,
    defaultValue: "",
  },
  render: (args) => html`
    <ui-accordion
      .type=${args.type || "single"}
      .value=${args.value || ""}
      .defaultValue=${args.defaultValue || ""}
      ?collapsible=${args.collapsible}
      ?disabled=${args.disabled}
      class="w-96"
    >
      <ui-accordion-item value="item-1">
        <ui-accordion-trigger>Is it accessible?</ui-accordion-trigger>
        <ui-accordion-content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </ui-accordion-content>
      </ui-accordion-item>
      <ui-accordion-item value="item-2">
        <ui-accordion-trigger>Is it styled?</ui-accordion-trigger>
        <ui-accordion-content>
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        </ui-accordion-content>
      </ui-accordion-item>
      <ui-accordion-item value="item-3">
        <ui-accordion-trigger>Is it animated?</ui-accordion-trigger>
        <ui-accordion-content>
          Yes. It's animated by default, but you can disable it if you prefer.
        </ui-accordion-content>
      </ui-accordion-item>
    </ui-accordion>
  `,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<AccordionArgs>;

/**
 * The default behavior of the accordion allows only one item to be open.
 */
export const Default: Story = {};

/**
 * Accordion with multiple items open at the same time.
 */
export const Multiple: Story = {
  args: {
    type: "multiple",
  },
};

/**
 * Accordion with disabled state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Accordion with a default open item.
 */
export const WithDefaultValue: Story = {
  args: {
    defaultValue: "item-2",
  },
};

/**
 * Accordion in single mode without collapsible behavior.
 */
export const NonCollapsible: Story = {
  args: {
    type: "single",
    collapsible: false,
    defaultValue: "item-1",
  },
};
