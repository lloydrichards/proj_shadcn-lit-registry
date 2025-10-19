import "./tabs";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { TabsProperties } from "./tabs";

type TabsArgs = TabsProperties;

/**
 * A set of layered sections of content—known as tab panels—that are displayed
 * one at a time.
 */
const meta: Meta<TabsArgs> = {
  title: "ui/Tabs",
  component: "ui-tabs",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: "text" },
    defaultValue: { control: "text" },
  },
  args: {
    defaultValue: "account",
  },
  render: (args) => html`
    <ui-tabs
      .defaultValue=${args.defaultValue || ""}
      .value=${args.value || ""}
      class="w-96"
    >
      <ui-tabs-list class="grid grid-cols-2">
        <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
        <ui-tabs-trigger value="password">Password</ui-tabs-trigger>
      </ui-tabs-list>
      <ui-tabs-content value="account">
        Make changes to your account here.
      </ui-tabs-content>
      <ui-tabs-content value="password">
        Change your password here.
      </ui-tabs-content>
    </ui-tabs>
  `,
};

export default meta;

type Story = StoryObj<TabsArgs>;

/**
 * The default form of the tabs.
 */
export const Default: Story = {};

/**
 * Tabs with three panels.
 */
export const ThreeTabs: Story = {
  args: {
    defaultValue: "overview",
  },
  render: (args) => html`
    <ui-tabs
      .defaultValue=${args.defaultValue || ""}
      .value=${args.value || ""}
      class="w-96"
    >
      <ui-tabs-list class="grid grid-cols-3">
        <ui-tabs-trigger value="overview">Overview</ui-tabs-trigger>
        <ui-tabs-trigger value="analytics">Analytics</ui-tabs-trigger>
        <ui-tabs-trigger value="reports">Reports</ui-tabs-trigger>
      </ui-tabs-list>
      <ui-tabs-content value="overview">
        View your account overview and summary.
      </ui-tabs-content>
      <ui-tabs-content value="analytics">
        Check your analytics and metrics.
      </ui-tabs-content>
      <ui-tabs-content value="reports">
        Download and review your reports.
      </ui-tabs-content>
    </ui-tabs>
  `,
};

/**
 * Tabs with disabled trigger.
 */
export const WithDisabled: Story = {
  render: (args) => html`
    <ui-tabs
      .defaultValue=${args.defaultValue || ""}
      .value=${args.value || ""}
      class="w-96"
    >
      <ui-tabs-list class="grid grid-cols-3">
        <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
        <ui-tabs-trigger value="password">Password</ui-tabs-trigger>
        <ui-tabs-trigger value="settings" .disabled=${true}
          >Settings</ui-tabs-trigger
        >
      </ui-tabs-list>
      <ui-tabs-content value="account">
        Make changes to your account here.
      </ui-tabs-content>
      <ui-tabs-content value="password">
        Change your password here.
      </ui-tabs-content>
      <ui-tabs-content value="settings">
        Configure your settings.
      </ui-tabs-content>
    </ui-tabs>
  `,
};
