import "./context-menu";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "ui/Context Menu",
  component: "ui-context-menu",
  tags: ["autodocs"],
  render: () => html`
    <ui-context-menu>
      <div
        slot="trigger"
        class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
      >
        Right click here
      </div>

      <ui-context-menu-content slot="content">
        <ui-context-menu-item>
          Back
          <ui-context-menu-shortcut slot="shortcut"
            >⌘[</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
        <ui-context-menu-item disabled>
          Forward
          <ui-context-menu-shortcut slot="shortcut"
            >⌘]</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
        <ui-context-menu-item>
          Reload
          <ui-context-menu-shortcut slot="shortcut"
            >⌘R</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
        <ui-context-menu-separator></ui-context-menu-separator>
        <ui-context-menu-item>Inspect</ui-context-menu-item>
      </ui-context-menu-content>
    </ui-context-menu>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithCheckboxes: Story = {
  render: () => html`
    <ui-context-menu>
      <div
        slot="trigger"
        class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
      >
        Right-click for options
      </div>

      <ui-context-menu-content slot="content">
        <ui-context-menu-checkbox-item checked>
          Show Bookmarks Bar
        </ui-context-menu-checkbox-item>
        <ui-context-menu-checkbox-item>
          Show Full URLs
        </ui-context-menu-checkbox-item>
        <ui-context-menu-separator></ui-context-menu-separator>
        <ui-context-menu-label>People</ui-context-menu-label>
        <ui-context-menu-radio-group value="pedro">
          <ui-context-menu-radio-item value="pedro">
            Pedro Duarte
          </ui-context-menu-radio-item>
          <ui-context-menu-radio-item value="colm">
            Colm Tuite
          </ui-context-menu-radio-item>
        </ui-context-menu-radio-group>
      </ui-context-menu-content>
    </ui-context-menu>
  `,
};

export const WithSubmenu: Story = {
  render: () => html`
    <ui-context-menu>
      <div
        slot="trigger"
        class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
      >
        Right-click for menu
      </div>

      <ui-context-menu-content slot="content">
        <ui-context-menu-item>Back</ui-context-menu-item>
        <ui-context-menu-item>Reload</ui-context-menu-item>

        <ui-context-menu-sub>
          <ui-context-menu-sub-trigger slot="trigger">
            More Tools
          </ui-context-menu-sub-trigger>

          <ui-context-menu-sub-content slot="content">
            <ui-context-menu-item>Save Page...</ui-context-menu-item>
            <ui-context-menu-item>Create Shortcut...</ui-context-menu-item>
            <ui-context-menu-separator></ui-context-menu-separator>
            <ui-context-menu-item>Developer Tools</ui-context-menu-item>
          </ui-context-menu-sub-content>
        </ui-context-menu-sub>

        <ui-context-menu-separator></ui-context-menu-separator>
        <ui-context-menu-item>Inspect</ui-context-menu-item>
      </ui-context-menu-content>
    </ui-context-menu>
  `,
};

export const WithShortcuts: Story = {
  render: () => html`
    <ui-context-menu>
      <div
        slot="trigger"
        class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
      >
        Right-click here
      </div>

      <ui-context-menu-content slot="content">
        <ui-context-menu-item>
          New Tab
          <ui-context-menu-shortcut slot="shortcut"
            >⌘T</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
        <ui-context-menu-item>
          New Window
          <ui-context-menu-shortcut slot="shortcut"
            >⌘N</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
        <ui-context-menu-separator></ui-context-menu-separator>
        <ui-context-menu-item>
          Close Tab
          <ui-context-menu-shortcut slot="shortcut"
            >⌘W</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
        <ui-context-menu-item>
          Close Window
          <ui-context-menu-shortcut slot="shortcut"
            >⌘⇧W</ui-context-menu-shortcut
          >
        </ui-context-menu-item>
      </ui-context-menu-content>
    </ui-context-menu>
  `,
};

export const Complex: Story = {
  render: () => html`
    <ui-context-menu>
      <div
        slot="trigger"
        class="flex h-[200px] w-[400px] items-center justify-center rounded-md border-2 border-dashed text-sm"
      >
        Right-click for full menu
      </div>

      <ui-context-menu-content slot="content">
        <ui-context-menu-label>Actions</ui-context-menu-label>
        <ui-context-menu-separator></ui-context-menu-separator>

        <ui-context-menu-group>
          <ui-context-menu-item>
            Cut
            <ui-context-menu-shortcut slot="shortcut"
              >⌘X</ui-context-menu-shortcut
            >
          </ui-context-menu-item>
          <ui-context-menu-item>
            Copy
            <ui-context-menu-shortcut slot="shortcut"
              >⌘C</ui-context-menu-shortcut
            >
          </ui-context-menu-item>
          <ui-context-menu-item>
            Paste
            <ui-context-menu-shortcut slot="shortcut"
              >⌘V</ui-context-menu-shortcut
            >
          </ui-context-menu-item>
        </ui-context-menu-group>

        <ui-context-menu-separator></ui-context-menu-separator>

        <ui-context-menu-checkbox-item checked>
          Show Grid
        </ui-context-menu-checkbox-item>
        <ui-context-menu-checkbox-item>
          Show Rulers
        </ui-context-menu-checkbox-item>

        <ui-context-menu-separator></ui-context-menu-separator>

        <ui-context-menu-sub>
          <ui-context-menu-sub-trigger slot="trigger">
            Share
          </ui-context-menu-sub-trigger>

          <ui-context-menu-sub-content slot="content">
            <ui-context-menu-item>Email</ui-context-menu-item>
            <ui-context-menu-item>Message</ui-context-menu-item>
            <ui-context-menu-separator></ui-context-menu-separator>
            <ui-context-menu-item>More...</ui-context-menu-item>
          </ui-context-menu-sub-content>
        </ui-context-menu-sub>

        <ui-context-menu-separator></ui-context-menu-separator>

        <ui-context-menu-item>Delete</ui-context-menu-item>
      </ui-context-menu-content>
    </ui-context-menu>
  `,
};
