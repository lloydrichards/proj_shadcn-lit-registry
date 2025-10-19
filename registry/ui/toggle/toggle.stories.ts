import "./toggle";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Bold, Italic } from "lucide-static";
import type { ToggleProperties } from "./toggle";

type ToggleArgs = ToggleProperties & {
  icon?: "bold" | "italic";
  withText?: boolean;
  text?: string;
};

/**
 * A two-state button that can be either on or off.
 */
const meta: Meta<ToggleArgs> = {
  title: "ui/Toggle",
  component: "ui-toggle",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    disabled: { control: "boolean" },
    pressed: { control: "boolean" },
    defaultPressed: { control: "boolean" },
    icon: { control: "select", options: ["bold", "italic"] },
    withText: { control: "boolean" },
    text: { control: "text" },
  },
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    defaultPressed: false,
    icon: "bold",
    withText: false,
    text: "Italic",
  },
  render: (args) => {
    const iconSvg = args.icon === "bold" ? Bold : Italic;
    return html`
      <ui-toggle
        .variant=${args.variant}
        .size=${args.size}
        .disabled=${args.disabled || false}
        .pressed=${args.pressed}
        .defaultPressed=${args.defaultPressed || false}
        aria-label=${`Toggle ${args.icon}`}
      >
        ${unsafeSVG(iconSvg)} ${args.withText ? args.text : ""}
      </ui-toggle>
    `;
  },
};

export default meta;

type Story = StoryObj<ToggleArgs>;

/**
 * The default form of the toggle.
 */
export const Default: Story = {};

/**
 * Use the `outline` variant for a distinct outline, emphasizing the boundary
 * of the selection circle for clearer visibility
 */
export const Outline: Story = {
  args: {
    variant: "outline",
    icon: "italic",
  },
};

/**
 * Use the text element to add a label to the toggle.
 */
export const WithText: Story = {
  args: {
    variant: "outline",
    icon: "italic",
    withText: true,
  },
};

/**
 * Use the `sm` size for a smaller toggle, suitable for interfaces needing
 * compact elements without sacrificing usability.
 */
export const Small: Story = {
  args: {
    size: "sm",
  },
};

/**
 * Use the `lg` size for a larger toggle, offering better visibility and
 * easier interaction for users.
 */
export const Large: Story = {
  args: {
    size: "lg",
  },
};

/**
 * Add the `disabled` prop to prevent interactions with the toggle.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
