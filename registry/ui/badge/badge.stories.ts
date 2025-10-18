import "./badge";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { BadgeVariants } from "./badge";

type BadgeArgs = {
  variant?: BadgeVariants["variant"];
  ariaLabel: string | null;
  children?: string;
};

/**
 * Displays a badge or a component that looks like a badge.
 */
const meta: Meta<BadgeArgs> = {
  title: "ui/Badge",
  component: "ui-badge",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    ariaLabel: {
      control: "text",
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "default",
    children: "Badge",
  },
  parameters: {
    layout: "centered",
  },
  render: (args) =>
    html`<ui-badge .variant=${args.variant} .ariaLabel=${args.ariaLabel}>
      ${args.children}
    </ui-badge>`,
};

export default meta;

type Story = StoryObj<BadgeArgs>;

/**
 * The default form of the badge.
 */
export const Default: Story = {};

/**
 * Use the `secondary` badge to call for less urgent information, blending
 * into the interface while still signaling minor updates or statuses.
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

/**
 * Use the `destructive` badge to  indicate errors, alerts, or the need for
 * immediate attention.
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

/**
 * Use the `outline` badge for overlaying without obscuring interface details,
 * emphasizing clarity and subtlety..
 */
export const Outline: Story = {
  args: {
    variant: "outline",
  },
};
