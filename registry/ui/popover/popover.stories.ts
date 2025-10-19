import type { Placement, Strategy } from "@floating-ui/dom";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../button/button.js";
import "./popover";
import type { Popover } from "./popover.js";

type PopoverArgs = {
  placement: Placement;
  distance: number;
  skidding: number;
  flip: boolean;
  shift: boolean;
  arrow: boolean;
  arrowPadding: number;
  strategy: Strategy;
  active: boolean;
  content?: string;
};

/**
 * Displays rich content in a portal, triggered by a button.
 */
const meta: Meta<PopoverArgs> = {
  title: "ui/Popover",
  component: "ui-popover",
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "right",
        "right-start",
        "right-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
      ],
    },
    distance: {
      control: { type: "number", min: 0, max: 50 },
    },
    skidding: {
      control: { type: "number", min: -50, max: 50 },
    },
    flip: {
      control: "boolean",
    },
    shift: {
      control: "boolean",
    },
    arrow: {
      control: "boolean",
    },
    arrowPadding: {
      control: { type: "number", min: 0, max: 20 },
    },
    strategy: {
      control: "select",
      options: ["absolute", "fixed"],
    },
    active: {
      control: "boolean",
    },
    content: {
      control: "text",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    placement: "top",
    distance: 8,
    skidding: 0,
    flip: true,
    shift: true,
    arrow: false,
    arrowPadding: 0,
    strategy: "absolute",
    active: false,
    content: "Place content for the popover here.",
  },
  render: (args) => {
    const handleToggle = (e: Event) => {
      const button = e.target as HTMLElement;
      const popover = button.closest("ui-popover") as Popover;
      popover?.toggle();
    };

    return html`
      <div class="flex min-h-64 items-center justify-center">
        <ui-popover
          .placement=${args.placement}
          .distance=${args.distance}
          .skidding=${args.skidding}
          .flip=${args.flip}
          .shift=${args.shift}
          .arrow=${args.arrow}
          .arrowPadding=${args.arrowPadding}
          .strategy=${args.strategy}
          .active=${args.active}
        >
          <ui-button slot="anchor" variant="outline" @click=${handleToggle}>
            Open
          </ui-button>
          <div
            class="w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
          >
            ${args.content}
          </div>
        </ui-popover>
      </div>
    `;
  },
};

export default meta;

type Story = StoryObj<PopoverArgs>;

/**
 * The default form of the popover.
 */
export const Default: Story = {};

/**
 * Popover positioned to the right.
 */
export const Right: Story = {
  args: {
    placement: "right",
    content: "Content positioned to the right.",
  },
};

/**
 * Popover positioned to the bottom.
 */
export const Bottom: Story = {
  args: {
    placement: "bottom",
    content: "Content positioned to the bottom.",
  },
};

/**
 * Demonstrates imperative control using show(), hide(), and toggle() methods.
 */
export const ImperativeControl: Story = {
  args: {
    content: "Use show() and hide() methods for explicit control.",
  },
  render: (args) => {
    const handleShow = (e: Event) => {
      const button = e.target as HTMLElement;
      const popover = button.closest("ui-popover") as Popover;
      popover?.show();
    };

    const handleHide = (e: Event) => {
      const button = e.target as HTMLElement;
      const popover = button.closest("ui-popover") as Popover;
      popover?.hide();
    };

    return html`
      <div class="flex min-h-64 items-center justify-center gap-2">
        <ui-popover
          .placement=${args.placement}
          .distance=${args.distance}
          .skidding=${args.skidding}
          .flip=${args.flip}
          .shift=${args.shift}
          .arrow=${args.arrow}
          .arrowPadding=${args.arrowPadding}
          .strategy=${args.strategy}
          .active=${args.active}
        >
          <div slot="anchor" class="flex gap-2">
            <ui-button variant="default" @click=${handleShow}>Show</ui-button>
            <ui-button variant="outline" @click=${handleHide}>Hide</ui-button>
          </div>
          <div
            class="w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
          >
            ${args.content}
          </div>
        </ui-popover>
      </div>
    `;
  },
};

/**
 * Custom styling can be applied via the class attribute on the popover.
 */
export const CustomStyling: Story = {
  args: {
    content:
      "This popover has a max-width applied via the class attribute on the ui-popover element. The class is forwarded to the popup container.",
  },
  render: (args) => {
    const handleToggle = (e: Event) => {
      const button = e.target as HTMLElement;
      const popover = button.closest("ui-popover") as Popover;
      popover?.toggle();
    };

    return html`
      <div class="flex min-h-64 items-center justify-center">
        <ui-popover
          class="max-w-sm"
          .placement=${args.placement}
          .distance=${args.distance}
          .skidding=${args.skidding}
          .flip=${args.flip}
          .shift=${args.shift}
          .arrow=${args.arrow}
          .arrowPadding=${args.arrowPadding}
          .strategy=${args.strategy}
          .active=${args.active}
        >
          <ui-button slot="anchor" variant="outline" @click=${handleToggle}>
            Open with custom width
          </ui-button>
          <div
            class="rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
          >
            ${args.content}
          </div>
        </ui-popover>
      </div>
    `;
  },
};
