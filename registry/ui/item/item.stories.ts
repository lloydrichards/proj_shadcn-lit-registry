import "./item";
import "../button/button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { BadgeCheck, ChevronRight, Plus, ShieldAlert } from "lucide-static";

/**
 * A versatile item component using named slots for flexible content composition.
 *
 * ## Slots
 * - `header` - Optional header content above main content
 * - `title` - Title content (automatically styled)
 * - `description` - Description content (automatically styled)
 * - `media` - Optional icon/avatar/image area
 * - (default) - Additional content area
 * - `actions` - Optional action buttons/controls
 * - `footer` - Optional footer content below main content
 *
 * ## Related components
 * - `ui-item-group` - Container for grouping items
 * - `ui-item-separator` - Visual divider between items
 */
const meta: Meta = {
  title: "ui/Item",
  component: "ui-item",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <ui-item-group>
      <ui-item variant="outline">
        <h3 slot="title">Basic Item</h3>
        <p slot="description">
          A simple item with title and description using named slots.
        </p>
        <ui-button slot="actions" variant="outline" size="sm">Action</ui-button>
      </ui-item>

      <ui-item variant="outline" size="sm">
        <div slot="media" class="size-5 text-destructive">
          ${unsafeSVG(BadgeCheck)}
        </div>
        <h3 slot="title">Your profile has been verified.</h3>
        <div slot="actions" class="size-4">${unsafeSVG(ChevronRight)}</div>
      </ui-item>
    </ui-item-group>
  `,
};

export const Outline: Story = {
  render: () => html`
    <ui-item variant="outline">
      <div
        slot="media"
        class="size-10 rounded-full bg-muted flex items-center justify-center"
      >
        CN
      </div>
      <h3 slot="title">Software Update Available</h3>
      <p slot="description">Version 2.0 is now available for download.</p>
      <ui-button slot="actions" size="sm" variant="outline">Update</ui-button>
    </ui-item>
  `,
};

export const Muted: Story = {
  render: () => html`
    <ui-item variant="muted">
      <div
        slot="media"
        class="size-10 rounded-md bg-muted/50 text-muted-foreground flex items-center justify-center"
      >
        ${unsafeSVG(BadgeCheck)}
      </div>
      <h3 slot="title">Account Verified</h3>
      <p slot="description">Your account has been successfully verified.</p>
      <ui-button slot="actions" size="sm" variant="ghost">Dismiss</ui-button>
    </ui-item>
  `,
};

export const Small: Story = {
  render: () => html`
    <ui-item-group>
      <ui-item variant="outline" size="sm">
        <div
          slot="media"
          class="size-8 rounded-full bg-muted flex items-center justify-center"
        >
          CN
        </div>
        <h3 slot="title">New message from shadcn</h3>
        <p slot="description">Hey, how are you doing?</p>
      </ui-item>
      <ui-item-separator></ui-item-separator>
      <ui-item variant="outline" size="sm">
        <div slot="media">
          <div
            class="size-8 rounded-full bg-muted flex items-center justify-center"
          >
            ML
          </div>
        </div>
        <h3 slot="title">New message from maxleiter</h3>
        <p slot="description">Check out this new feature!</p>
      </ui-item>
    </ui-item-group>
  `,
};

export const WithIcon: Story = {
  render: () => html`
    <ui-item variant="outline">
      <div
        slot="media"
        class="size-10 rounded-md bg-muted/50 text-muted-foreground"
      >
        ${unsafeSVG(ShieldAlert)}
      </div>
      <h3 slot="title">Security Alert</h3>
      <p slot="description">New login detected from unknown device.</p>
      <ui-button slot="actions" size="sm" variant="outline">Review</ui-button>
    </ui-item>
  `,
};

export const WithAvatar: Story = {
  render: () => html`
    <ui-item variant="outline">
      <div
        slot="media"
        class="size-10 rounded-full bg-muted flex items-center justify-center"
      >
        ER
      </div>

      <h3 slot="title">Evil Rabbit</h3>
      <p slot="description">Last seen 5 months ago</p>
      <ui-button
        slot="actions"
        size="icon-sm"
        variant="outline"
        class="rounded-full"
        aria-label="Invite"
      >
        ${unsafeSVG(Plus)}
      </ui-button>
    </ui-item>
  `,
};

export const WithGroup: Story = {
  render: () => {
    const people = [
      { username: "shadcn", email: "shadcn@vercel.com" },
      { username: "maxleiter", email: "maxleiter@vercel.com" },
      { username: "evilrabbit", email: "evilrabbit@vercel.com" },
    ];

    return html`
      <ui-item-group>
        ${people.map(
          (person, index) => html`
            <ui-item>
              <div
                slot="media"
                class="size-10 rounded-full bg-muted flex items-center justify-center"
              >
                ${person.username.charAt(0).toUpperCase()}
              </div>
              <h3 slot="title">${person.username}</h3>
              <p slot="description">${person.email}</p>
              <ui-button
                slot="actions"
                variant="ghost"
                size="icon"
                class="rounded-full"
              >
                ${unsafeSVG(Plus)}
              </ui-button>
            </ui-item>
            ${
              index !== people.length - 1
                ? html`<ui-item-separator></ui-item-separator>`
                : ""
            }
          `,
        )}
      </ui-item-group>
    `;
  },
};

export const WithHeader: Story = {
  render: () => {
    const models = [
      {
        name: "v0-1.5-sm",
        description: "Everyday tasks and UI generation.",
      },
      {
        name: "v0-1.5-lg",
        description: "Advanced thinking or reasoning.",
      },
      {
        name: "v0-2.0-mini",
        description: "Open Source model for everyone.",
      },
    ];

    return html`
      <ui-item-group class="grid grid-cols-3 gap-4">
        ${models.map(
          (model) => html`
            <ui-item variant="outline">
              <div
                slot="header"
                class="aspect-square w-full rounded-sm bg-muted"
              ></div>
              <h3 slot="title">${model.name}</h3>
              <p slot="description">${model.description}</p>
            </ui-item>
          `,
        )}
      </ui-item-group>
    `;
  },
};

export const WithFooter: Story = {
  render: () => html`
    <ui-item variant="outline">
      <div
        slot="media"
        class="size-10 rounded-full bg-muted flex items-center justify-center"
      >
        CN
      </div>
      <h3 slot="title">Component Updated</h3>
      <p slot="description">
        The item component has been refactored to use named slots.
      </p>
      <div slot="footer" class="text-xs text-muted-foreground w-full">
        Last updated: 2 hours ago
      </div>
    </ui-item>
  `,
};

export const CustomClasses: Story = {
  render: () => html`
    <ui-item variant="outline">
      <!-- Custom classes on media slot are merged with defaults -->
      <div
        slot="media"
        class="size-12 border-2 border-primary rounded-lg bg-primary/10"
      >
        ${unsafeSVG(BadgeCheck)}
      </div>
      <h3 slot="title">Custom Styled Item</h3>
      <p slot="description">
        This item demonstrates how custom classes on slotted elements are merged
        with defaults.
      </p>
      <ui-button slot="actions" size="sm">View</ui-button>
    </ui-item>
  `,
};

export const MixedApproach: Story = {
  render: () => html`
    <ui-item-group>
      <!-- Using slots for structure -->
      <ui-item variant="outline">
        <div
          slot="header"
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Notification
        </div>
        <div
          slot="media"
          class="size-10 rounded-md bg-blue-500/10 text-blue-500"
        >
          ${unsafeSVG(BadgeCheck)}
        </div>
        <h3 slot="title">Verification Complete</h3>
        <p slot="description">Your account has been verified successfully.</p>
        <ui-button slot="actions" size="sm" variant="ghost">Dismiss</ui-button>
        <div slot="footer" class="text-xs text-muted-foreground w-full">
          Just now
        </div>
      </ui-item>

      <ui-item-separator></ui-item-separator>

      <!-- Another item with different structure -->
      <ui-item variant="outline">
        <div
          slot="media"
          class="size-10 rounded-md bg-orange-500/10 text-orange-500"
        >
          ${unsafeSVG(ShieldAlert)}
        </div>
        <h3 slot="title">Security Alert</h3>
        <p slot="description">New login from unrecognized device.</p>
        <ui-button slot="actions" size="sm" variant="outline">Review</ui-button>
      </ui-item>
    </ui-item-group>
  `,
};

export const LayoutFlexibility: Story = {
  render: () => html`
    <ui-item-group>
      <!-- Full width item -->
      <ui-item variant="outline" class="w-full max-w-2xl">
        <div slot="media">
          <div
            class="size-10 rounded-full bg-muted flex items-center justify-center"
          >
            CN
          </div>
        </div>
        <h3 slot="title">Full Width Item</h3>
        <p slot="description">
          This item uses className forwarding to apply max-w-2xl.
        </p>
      </ui-item>

      <!-- Fixed width item -->
      <ui-item variant="outline" class="w-96">
        <div slot="media">
          <div
            class="size-10 rounded-full bg-muted flex items-center justify-center"
          >
            ML
          </div>
        </div>
        <h3 slot="title">Fixed Width Item</h3>
        <p slot="description">This item has a fixed width of w-96.</p>
      </ui-item>
    </ui-item-group>
  `,
};
