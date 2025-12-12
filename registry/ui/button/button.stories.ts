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
    loading: {
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
    loading: false,
    children: "Button",
  },
  render: (args) =>
    html`<ui-button
      .variant=${args.variant}
      .size=${args.size}
      .type=${args.type}
      .disabled=${args.disabled}
      .loading=${args.loading}
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

/**
 * Add the `loading` prop to show a loading state.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading...",
  },
};

/**
 * Loading states work with all variants.
 */
export const LoadingVariants: Story = {
  render: () => html`
    <div class="flex flex-col gap-4">
      <ui-button loading>Default Loading</ui-button>
      <ui-button loading variant="secondary">Secondary Loading</ui-button>
      <ui-button loading variant="outline">Outline Loading</ui-button>
      <ui-button loading variant="destructive">Destructive Loading</ui-button>
    </div>
  `,
};

/**
 * Use the `prefix` slot to add content before the button text.
 */
export const WithPrefix: Story = {
  render: () => html`
    <ui-button>
      <svg
        slot="prefix"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
        />
      </svg>
      Home
    </ui-button>
  `,
};

/**
 * Use the `suffix` slot to add content after the button text.
 */
export const WithSuffix: Story = {
  render: () => html`
    <ui-button>
      Next
      <svg
        slot="suffix"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </ui-button>
  `,
};

/**
 * Combine prefix and suffix slots for complex button layouts.
 */
export const WithPrefixAndSuffix: Story = {
  render: () => html`
    <ui-button variant="outline">
      <svg
        slot="prefix"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fill-rule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clip-rule="evenodd"
        />
      </svg>
      View Details
      <svg
        slot="suffix"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </ui-button>
  `,
};

/**
 * Test form submission with submit and reset buttons.
 */
export const FormSubmission: Story = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        alert("Form submitted!");
      }}
      class="flex flex-col gap-4 max-w-md"
    >
      <input
        type="text"
        required
        placeholder="Enter text (required)"
        class="px-3 py-2 border rounded-md"
      />
      <div class="flex gap-2">
        <ui-button type="submit">Submit</ui-button>
        <ui-button type="reset" variant="outline">Reset</ui-button>
      </div>
    </form>
  `,
};
