import "./button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import type { TemplateResult } from "lit";
import { html } from "lit";
import type { UnsafeSVGDirective } from "lit/directives/unsafe-svg.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import type { DirectiveResult } from "lit-html/directive.js";
import { Search } from "lucide-static";
import type { ButtonProperties } from "./button";

type ButtonArgs = ButtonProperties & {
  children?:
    | string
    | TemplateResult
    | DirectiveResult<typeof UnsafeSVGDirective>;
};

/**
 * Displays a button or a component that looks like a button.
 */
const meta: Meta<ButtonArgs> = {
  title: "ui/Button",
  component: "ui-button",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon-sm", "icon", "icon-lg"],
      if: { arg: "variant", neq: "link" },
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    disabled: {
      control: "boolean",
    },
    ariaLabel: {
      control: "text",
    },
    ariaDescribedby: {
      control: "text",
    },
    ariaLabelledby: {
      control: "text",
    },
    children: {
      control: "text",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
    type: "button",
    disabled: false,
    children: "Button",
  },
  render: (args) =>
    html`<ui-button
      .variant=${args.variant}
      .size=${args.size}
      .type=${args.type}
      .disabled=${args.disabled}
      .ariaLabel=${args.ariaLabel}
      .ariaDescribedby=${args.ariaDescribedby}
      .ariaLabelledby=${args.ariaLabelledby}
    >
      ${args.children}
    </ui-button>`,
};

export default meta;

type Story = StoryObj<ButtonArgs>;

/**
 * The default form of the button, used for primary actions and commands.
 */
export const Default: Story = {};

/**
 * Use the `outline` button to reduce emphasis on secondary actions, such as
 * canceling or dismissing a dialog.
 */
export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

/**
 * Use the `ghost` button is minimalistic and subtle, for less intrusive
 * actions.
 */
export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

/**
 * Use the `secondary` button to call for less emphasized actions, styled to
 * complement the primary button while being less conspicuous.
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

/**
 * Use the `destructive` button to indicate errors, alerts, or the need for
 * immediate attention.
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

/**
 * Use the `link` button to reduce emphasis on tertiary actions, such as
 * hyperlink or navigation, providing a text-only interactive element.
 */
export const Link: Story = {
  args: {
    variant: "link",
  },
};

/**
 * Use the `sm` size for a smaller button, suitable for interfaces needing
 * compact elements without sacrificing usability.
 */
export const Small: Story = {
  args: {
    size: "sm",
  },
};

/**
 * Use the `lg` size for a larger button, offering better visibility and
 * easier interaction for users.
 */
export const Large: Story = {
  args: {
    size: "lg",
  },
};

/**
 * Use the "icon" size for a button with only an icon.
 */
export const Icon: Story = {
  args: {
    variant: "secondary",
    size: "icon",
    ariaLabel: "Icon button",
    children: unsafeSVG(Search),
  },
};

/**
 * Use the `icon-sm` size for a smaller icon-only button.
 */
export const IconSmall: Story = {
  args: {
    variant: "secondary",
    size: "icon-sm",
    ariaLabel: "Small icon button",
    children: unsafeSVG(Search),
  },
};

/**
 * Use the `icon-lg` size for a larger icon-only button.
 */
export const IconLarge: Story = {
  args: {
    variant: "secondary",
    size: "icon-lg",
    ariaLabel: "Large icon button",
    children: unsafeSVG(Search),
  },
};

/**
 * Add the `disabled` prop to prevent interactions with the button.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
