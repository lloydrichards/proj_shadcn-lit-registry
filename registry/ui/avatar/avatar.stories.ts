import "./avatar";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { AvatarProperties } from "./avatar";

type AvatarArgs = AvatarProperties & { fallback?: string };

const meta: Meta<AvatarArgs> = {
  title: "ui/Avatar",
  component: "ui-avatar",
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "Image source URL",
    },
    alt: {
      control: "text",
      description: "Image alt text for accessibility",
    },
    loading: {
      control: "select",
      options: ["eager", "lazy"],
      description: "Image loading strategy",
    },
    fallback: {
      control: "text",
      description: "Fallback content (e.g., initials)",
    },
  },
  args: {
    src: "https://github.com/shadcn.png",
    alt: "@shadcn",
    loading: "lazy",
    fallback: "CN",
  },
  parameters: {
    layout: "centered",
  },
  render: (args) => html`
    <ui-avatar
      src=${args.src || ""}
      alt=${args.alt || ""}
      loading=${args.loading || "lazy"}
    >
      ${args.fallback || ""}
    </ui-avatar>
  `,
};

export default meta;
type Story = StoryObj<AvatarArgs>;

export const Default: Story = {};

export const FallbackOnly: Story = {
  args: {
    src: "",
    fallback: "JD",
  },
};

export const WithBrokenImage: Story = {
  args: {
    src: "https://invalid-url-that-will-fail.example.com/image.jpg",
    fallback: "AB",
  },
};

export const CustomSize: Story = {
  render: (args) => html`
    <div class="flex items-center gap-4">
      <ui-avatar src=${args.src || ""} alt=${args.alt || ""} class="size-8">
        ${args.fallback}
      </ui-avatar>
      <ui-avatar src=${args.src || ""} alt=${args.alt || ""}>
        ${args.fallback}
      </ui-avatar>
      <ui-avatar src=${args.src || ""} alt=${args.alt || ""} class="size-16">
        ${args.fallback}
      </ui-avatar>
      <ui-avatar src=${args.src || ""} alt=${args.alt || ""} class="size-24">
        ${args.fallback}
      </ui-avatar>
    </div>
  `,
};

export const CustomShape: Story = {
  render: (args) => html`
    <div class="flex items-center gap-4">
      <ui-avatar src=${args.src || ""} alt=${args.alt || ""}>
        ${args.fallback}
      </ui-avatar>
      <ui-avatar src=${args.src || ""} alt=${args.alt || ""} class="rounded-lg">
        ${args.fallback}
      </ui-avatar>
      <ui-avatar
        src=${args.src || ""}
        alt=${args.alt || ""}
        class="rounded-none"
      >
        ${args.fallback}
      </ui-avatar>
    </div>
  `,
};

export const StackedAvatars: Story = {
  render: () => html`
    <div class="flex -space-x-2">
      <ui-avatar
        class="ring-2 ring-background"
        src="https://github.com/shadcn.png"
        alt="User 1"
      >
        U1
      </ui-avatar>
      <ui-avatar
        class="ring-2 ring-background"
        src="https://github.com/vercel.png"
        alt="User 2"
      >
        U2
      </ui-avatar>
      <ui-avatar
        class="ring-2 ring-background"
        src="https://github.com/react.png"
        alt="User 3"
      >
        U3
      </ui-avatar>
      <ui-avatar class="ring-2 ring-background" alt="User 4"> +2 </ui-avatar>
    </div>
  `,
};

export const WithImageSlot: Story = {
  render: (args) => html`
    <ui-avatar alt=${args.alt || ""}>
      <img slot="image" src=${args.src || ""} alt=${args.alt || ""} />
      ${args.fallback}
    </ui-avatar>
  `,
};
