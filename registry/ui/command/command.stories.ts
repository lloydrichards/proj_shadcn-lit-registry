import "./command";
import "../dialog/dialog";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-static";
import type { CommandProperties } from "./command";

type CommandArgs = CommandProperties & {
  className?: string;
};

/**
 * Fast, composable, unstyled command menu web component.
 * Features search/filtering, keyboard navigation, item grouping, and accessibility support.
 */
const meta: Meta<CommandArgs> = {
  title: "ui/Command",
  component: "ui-command",
  tags: ["autodocs"],
  argTypes: {
    shouldFilter: {
      control: "boolean",
      description: "Enable/disable automatic filtering",
      defaultValue: true,
    },
    loop: {
      control: "boolean",
      description: "Wrap keyboard navigation at edges",
      defaultValue: false,
    },
    value: {
      control: "text",
      description: "Currently selected item value",
    },
    label: {
      control: "text",
      description: "Accessible label for screen readers",
      defaultValue: "Command Menu",
    },
  },
  args: {
    className: "rounded-lg w-96 border shadow-md",
    shouldFilter: true,
    loop: false,
  },
  render: (args) => html`
    <ui-command
      class=${args.className || ""}
      ?should-filter=${args.shouldFilter}
      ?loop=${args.loop}
      .value=${args.value || ""}
      label=${args.label || "Command Menu"}
    >
      <ui-command-input
        placeholder="Type a command or search..."
      ></ui-command-input>
      <ui-command-list>
        <ui-command-empty>No results found.</ui-command-empty>
        <ui-command-group heading="Suggestions">
          <ui-command-item value="calendar">Calendar</ui-command-item>
          <ui-command-item value="emoji">Search Emoji</ui-command-item>
          <ui-command-item value="calculator" disabled
            >Calculator</ui-command-item
          >
        </ui-command-group>
        <ui-command-separator></ui-command-separator>
        <ui-command-group heading="Settings">
          <ui-command-item value="profile">Profile</ui-command-item>
          <ui-command-item value="billing">Billing</ui-command-item>
          <ui-command-item value="settings">Settings</ui-command-item>
        </ui-command-group>
      </ui-command-list>
    </ui-command>
  `,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<CommandArgs>;

/**
 * The default form of the command menu.
 */
export const Default: Story = {};

/**
 * Command menu with keyboard shortcuts displayed.
 */
export const WithShortcuts: Story = {
  render: (args) => html`
    <ui-command
      class=${args.className || ""}
      ?should-filter=${args.shouldFilter}
      ?loop=${args.loop}
    >
      <ui-command-input
        placeholder="Type a command or search..."
      ></ui-command-input>
      <ui-command-list>
        <ui-command-empty>No results found.</ui-command-empty>
        <ui-command-group heading="Suggestions">
          <ui-command-item value="calendar">
            ${unsafeHTML(Calendar)} Calendar
          </ui-command-item>
          <ui-command-item value="emoji">
            ${unsafeHTML(Smile)} Search Emoji
          </ui-command-item>
          <ui-command-item value="calculator" disabled>
            ${unsafeHTML(Calculator)} Calculator
          </ui-command-item>
        </ui-command-group>
        <ui-command-separator></ui-command-separator>
        <ui-command-group heading="Settings">
          <ui-command-item value="profile">
            ${unsafeHTML(User)} Profile
            <ui-command-shortcut slot="shortcut">⌘P</ui-command-shortcut>
          </ui-command-item>
          <ui-command-item value="billing">
            ${unsafeHTML(CreditCard)} Billing
            <ui-command-shortcut slot="shortcut">⌘B</ui-command-shortcut>
          </ui-command-item>
          <ui-command-item value="settings">
            ${unsafeHTML(Settings)} Settings
            <ui-command-shortcut slot="shortcut">⌘S</ui-command-shortcut>
          </ui-command-item>
        </ui-command-group>
      </ui-command-list>
    </ui-command>
  `,
};

/**
 * Command menu with loading state.
 */
export const LoadingState: Story = {
  render: (args) => html`
    <ui-command class=${args.className || ""}>
      <ui-command-input placeholder="Searching..."></ui-command-input>
      <ui-command-list>
        <ui-command-loading>Fetching results...</ui-command-loading>
      </ui-command-list>
    </ui-command>
  `,
};

/**
 * Command menu displayed in a dialog. Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open.
 * This is commonly used for application-wide command palettes (like VS Code's Command Palette).
 */
export const Dialog: Story = {
  render: () => html`
    <div class="flex flex-col items-center gap-4">
      <p class="text-sm text-muted-foreground">
        Press
        <kbd
          class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          <span class="text-xs">⌘</span>K
        </kbd>
      </p>

      <ui-command-dialog>
        <ui-command-group heading="Suggestions">
          <ui-command-item value="calendar">
            ${unsafeHTML(Calendar)}
            <span>Calendar</span>
          </ui-command-item>
          <ui-command-item value="emoji">
            ${unsafeHTML(Smile)}
            <span>Search Emoji</span>
          </ui-command-item>
          <ui-command-item value="calculator">
            ${unsafeHTML(Calculator)}
            <span>Calculator</span>
          </ui-command-item>
        </ui-command-group>

        <ui-command-separator></ui-command-separator>

        <ui-command-group heading="Settings">
          <ui-command-item value="profile">
            ${unsafeHTML(User)}
            <span>Profile</span>
            <ui-command-shortcut slot="shortcut">⌘P</ui-command-shortcut>
          </ui-command-item>
          <ui-command-item value="billing">
            ${unsafeHTML(CreditCard)}
            <span>Billing</span>
            <ui-command-shortcut slot="shortcut">⌘B</ui-command-shortcut>
          </ui-command-item>
          <ui-command-item value="settings">
            ${unsafeHTML(Settings)}
            <span>Settings</span>
            <ui-command-shortcut slot="shortcut">⌘S</ui-command-shortcut>
          </ui-command-item>
        </ui-command-group>
      </ui-command-dialog>
    </div>
  `,
};

/**
 * Command dialog in open state for testing and visual inspection.
 */
export const DialogOpen: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => html`
    <ui-command-dialog open>
      <ui-command-group heading="Suggestions">
        <ui-command-item value="calendar">
          ${unsafeHTML(Calendar)}
          <span>Calendar</span>
        </ui-command-item>
        <ui-command-item value="emoji">
          ${unsafeHTML(Smile)}
          <span>Search Emoji</span>
        </ui-command-item>
        <ui-command-item value="calculator">
          ${unsafeHTML(Calculator)}
          <span>Calculator</span>
        </ui-command-item>
      </ui-command-group>

      <ui-command-separator></ui-command-separator>

      <ui-command-group heading="Settings">
        <ui-command-item value="profile">
          ${unsafeHTML(User)}
          <span>Profile</span>
          <ui-command-shortcut slot="shortcut">⌘P</ui-command-shortcut>
        </ui-command-item>
        <ui-command-item value="billing">
          ${unsafeHTML(CreditCard)}
          <span>Billing</span>
          <ui-command-shortcut slot="shortcut">⌘B</ui-command-shortcut>
        </ui-command-item>
        <ui-command-item value="settings">
          ${unsafeHTML(Settings)}
          <span>Settings</span>
          <ui-command-shortcut slot="shortcut">⌘S</ui-command-shortcut>
        </ui-command-item>
      </ui-command-group>
    </ui-command-dialog>
  `,
};
