import "./card";
import "../button/button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { BellRing } from "lucide-static";

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

/**
 * Displays a card with header, content, and footer.
 */
const meta: Meta = {
  title: "ui/Card",
  component: "ui-card",
  tags: ["autodocs"],
  argTypes: {},
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

/**
 * The default form of the card.
 */
export const Default: Story = {
  render: () => html`
    <ui-card class="w-96">
      <ui-card-header>
        <ui-card-title>Notifications</ui-card-title>
        <ui-card-description>You have 3 unread messages.</ui-card-description>
      </ui-card-header>
      <ui-card-content class="grid gap-4">
        ${notifications.map(
          (notification) => html`
            <div class="flex items-center gap-4">
              <div class="size-6">${unsafeSVG(BellRing)}</div>
              <div>
                <p>${notification.title}</p>
                <p class="text-foreground/60">${notification.description}</p>
              </div>
            </div>
          `,
        )}
      </ui-card-content>
      <ui-card-footer>
        <ui-button variant="link">Close</ui-button>
      </ui-card-footer>
    </ui-card>
  `,
};

/**
 * Use the `CardAction` component to add interactive elements in the header.
 */
export const WithCardAction: Story = {
  render: () => html`
    <ui-card class="w-96">
      <ui-card-header>
        <ui-card-title>Team Settings</ui-card-title>
        <ui-card-description>Manage your team preferences</ui-card-description>
        <ui-card-action>
          <ui-button size="sm" variant="outline">Edit</ui-button>
        </ui-card-action>
      </ui-card-header>
      <ui-card-content>
        <p>Configure team members, permissions, and notifications.</p>
      </ui-card-content>
      <ui-card-footer>
        <ui-button variant="ghost">Cancel</ui-button>
        <ui-button class="ml-auto">Save Changes</ui-button>
      </ui-card-footer>
    </ui-card>
  `,
};

/**
 * A minimal card with only content, no header or footer.
 */
export const MinimalCard: Story = {
  render: () => html`
    <ui-card class="w-96">
      <ui-card-content>
        <p class="text-sm">
          This is a minimal card with only content. Perfect for displaying
          simple information without the need for a header or footer.
        </p>
      </ui-card-content>
    </ui-card>
  `,
};

/**
 * A card with only a header section, no content or footer.
 */
export const HeaderOnly: Story = {
  render: () => html`
    <ui-card class="w-96">
      <ui-card-header>
        <ui-card-title>Quick Stats</ui-card-title>
        <ui-card-description>
          Your account summary at a glance. Click for details.
        </ui-card-description>
      </ui-card-header>
    </ui-card>
  `,
};
