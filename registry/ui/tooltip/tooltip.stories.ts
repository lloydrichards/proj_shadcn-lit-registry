import "./tooltip";
import "../button/button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Plus } from "lucide-static";
import type { TooltipProperties } from "./tooltip";

type TooltipArgs = TooltipProperties & {
  buttonText?: string;
};

const meta: Meta<TooltipArgs> = {
  title: "ui/Tooltip",
  component: "ui-tooltip",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    content: { control: "text" },
    placement: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    buttonText: { control: "text" },
  },
  args: {
    content: "Add to library",
    placement: "top",
    buttonText: "Add",
  },
  render: (args) => html`
    <div class="flex min-h-64 items-center justify-center">
      <ui-tooltip
        .content=${args.content || ""}
        .placement=${args.placement || "top"}
      >
        <ui-button variant="ghost" size="icon">
          ${unsafeSVG(Plus)}
          <span class="sr-only">${args.buttonText}</span>
        </ui-button>
      </ui-tooltip>
    </div>
  `,
};

export default meta;

type Story = StoryObj<TooltipArgs>;

/**
 * The default form of the tooltip.
 */
export const Default: Story = {};

/**
 * Use the `bottom` side to display the tooltip below the element.
 */
export const Bottom: Story = {
  args: {
    placement: "bottom",
  },
};

/**
 * Use the `left` side to display the tooltip to the left of the element.
 */
export const Left: Story = {
  args: {
    placement: "left",
  },
};

/**
 * Use the `right` side to display the tooltip to the right of the element.
 */
export const Right: Story = {
  args: {
    placement: "right",
  },
};

/**
 * Tooltip with custom content using slot.
 */
export const CustomContent: Story = {
  render: () => html`
    <div class="flex min-h-64 items-center justify-center">
      <ui-tooltip placement="top">
        <ui-button variant="ghost" size="icon">
          <div class="[&>svg]:size-5">${unsafeSVG(Plus)}</div>
          <span class="sr-only">Add</span>
        </ui-button>
        <div slot="content">
          <strong>Add to library</strong>
          <p class="text-xs">Press Ctrl+A</p>
        </div>
      </ui-tooltip>
    </div>
  `,
};
