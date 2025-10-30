import "./collapsible";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Info } from "lucide-static";
import type { CollapsibleProperties } from "./collapsible";

type CollapsibleArgs = CollapsibleProperties;

/**
 * An interactive component which expands/collapses a panel.
 */
const meta: Meta<CollapsibleArgs> = {
  title: "ui/Collapsible",
  component: "ui-collapsible",
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state",
    },
    defaultOpen: {
      control: "boolean",
      description: "Default open state (uncontrolled)",
    },
    disabled: {
      control: "boolean",
      description: "Disable interaction",
    },
  },
  args: {
    disabled: false,
  },
  render: (args) => html`
    <ui-collapsible
      ?open=${args.open}
      ?defaultOpen=${args.defaultOpen}
      ?disabled=${args.disabled}
      class="w-96"
    >
      <ui-collapsible-trigger class="flex gap-2">
        <h3 class="font-semibold">Can I use this in my project?</h3>
        ${unsafeSVG(Info.replace("<svg", '<svg class="size-6"'))}
      </ui-collapsible-trigger>
      <ui-collapsible-content>
        <p class="pt-2">
          Yes. Free to use for personal and commercial projects. No attribution
          required.
        </p>
      </ui-collapsible-content>
    </ui-collapsible>
  `,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<CollapsibleArgs>;

/**
 * The default form of the collapsible.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the interaction.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Collapsible with default open state.
 */
export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
};

/**
 * Collapsible with controlled open state.
 */
export const Controlled: Story = {
  args: {
    open: true,
  },
};

/**
 * Collapsible with custom trigger styling.
 */
export const WithCustomTrigger: Story = {
  render: (args) => html`
    <ui-collapsible
      ?open=${args.open}
      ?defaultOpen=${args.defaultOpen}
      ?disabled=${args.disabled}
      class="w-96"
    >
      <ui-collapsible-trigger>
        <button
          class="flex w-full items-center justify-between rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <span>Show more information</span>
          <svg
            class="size-4 transition-transform duration-200 data-[state=open]:rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </ui-collapsible-trigger>
      <ui-collapsible-content>
        <div class="rounded-b-md border border-t-0 border-input p-4">
          <p class="text-sm text-muted-foreground">
            This is additional information that can be revealed by clicking the
            trigger above. The content is hidden by default and smoothly
            animates when toggled.
          </p>
        </div>
      </ui-collapsible-content>
    </ui-collapsible>
  `,
};
