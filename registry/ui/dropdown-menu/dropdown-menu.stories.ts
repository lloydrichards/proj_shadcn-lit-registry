import "./dropdown-menu";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "ui/Dropdown Menu",
  component: "ui-dropdown-menu",
  tags: ["autodocs"],
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger">
        Open Menu
      </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-item>Profile</ui-dropdown-menu-item>
        <ui-dropdown-menu-item>Settings</ui-dropdown-menu-item>
        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
        <ui-dropdown-menu-item>Logout</ui-dropdown-menu-item>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithCheckboxes: Story = {
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger">
        View Options
      </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-label>Appearance</ui-dropdown-menu-label>
        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
        <ui-dropdown-menu-checkbox-item checked>
          Show Toolbar
        </ui-dropdown-menu-checkbox-item>
        <ui-dropdown-menu-checkbox-item>
          Show Sidebar
        </ui-dropdown-menu-checkbox-item>
        <ui-dropdown-menu-checkbox-item>
          Show Footer
        </ui-dropdown-menu-checkbox-item>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};

export const WithRadioGroup: Story = {
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger">
        Text Size
      </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-label>Font Size</ui-dropdown-menu-label>
        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
        <ui-dropdown-menu-radio-group value="medium">
          <ui-dropdown-menu-radio-item value="small"
            >Small</ui-dropdown-menu-radio-item
          >
          <ui-dropdown-menu-radio-item value="medium"
            >Medium</ui-dropdown-menu-radio-item
          >
          <ui-dropdown-menu-radio-item value="large"
            >Large</ui-dropdown-menu-radio-item
          >
        </ui-dropdown-menu-radio-group>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};

export const WithSubmenu: Story = {
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger">
        File Menu
      </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-item>
          New File
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘N</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>

        <ui-dropdown-menu-sub>
          <ui-dropdown-menu-sub-trigger slot="trigger">
            Open Recent
          </ui-dropdown-menu-sub-trigger>

          <ui-dropdown-menu-sub-content slot="content">
            <ui-dropdown-menu-item>document.txt</ui-dropdown-menu-item>
            <ui-dropdown-menu-item>image.png</ui-dropdown-menu-item>
            <ui-dropdown-menu-item>presentation.pdf</ui-dropdown-menu-item>
          </ui-dropdown-menu-sub-content>
        </ui-dropdown-menu-sub>

        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
        <ui-dropdown-menu-item>
          Save
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘S</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};

export const WithShortcuts: Story = {
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger"> Edit </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-item>
          Undo
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘Z</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
        <ui-dropdown-menu-item>
          Redo
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘⇧Z</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
        <ui-dropdown-menu-item>
          Cut
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘X</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
        <ui-dropdown-menu-item>
          Copy
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘C</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
        <ui-dropdown-menu-item>
          Paste
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⌘V</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};

export const WithDisabledItems: Story = {
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger">
        Actions
      </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-item>Edit</ui-dropdown-menu-item>
        <ui-dropdown-menu-item>Duplicate</ui-dropdown-menu-item>
        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
        <ui-dropdown-menu-item disabled>Archive</ui-dropdown-menu-item>
        <ui-dropdown-menu-item>Delete</ui-dropdown-menu-item>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};

export const Complex: Story = {
  render: () => html`
    <ui-dropdown-menu>
      <ui-dropdown-menu-trigger slot="trigger">
        Account
      </ui-dropdown-menu-trigger>

      <ui-dropdown-menu-content slot="content">
        <ui-dropdown-menu-label>My Account</ui-dropdown-menu-label>
        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>

        <ui-dropdown-menu-group>
          <ui-dropdown-menu-item>
            Profile
            <ui-dropdown-menu-shortcut slot="shortcut"
              >⌘P</ui-dropdown-menu-shortcut
            >
          </ui-dropdown-menu-item>
          <ui-dropdown-menu-item>
            Billing
            <ui-dropdown-menu-shortcut slot="shortcut"
              >⌘B</ui-dropdown-menu-shortcut
            >
          </ui-dropdown-menu-item>
          <ui-dropdown-menu-item>
            Settings
            <ui-dropdown-menu-shortcut slot="shortcut"
              >⌘S</ui-dropdown-menu-shortcut
            >
          </ui-dropdown-menu-item>
        </ui-dropdown-menu-group>

        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>

        <ui-dropdown-menu-sub>
          <ui-dropdown-menu-sub-trigger slot="trigger">
            Invite users
          </ui-dropdown-menu-sub-trigger>

          <ui-dropdown-menu-sub-content slot="content">
            <ui-dropdown-menu-item>Email</ui-dropdown-menu-item>
            <ui-dropdown-menu-item>Message</ui-dropdown-menu-item>
            <ui-dropdown-menu-separator></ui-dropdown-menu-separator>
            <ui-dropdown-menu-item>More...</ui-dropdown-menu-item>
          </ui-dropdown-menu-sub-content>
        </ui-dropdown-menu-sub>

        <ui-dropdown-menu-separator></ui-dropdown-menu-separator>

        <ui-dropdown-menu-item>
          Log out
          <ui-dropdown-menu-shortcut slot="shortcut"
            >⇧⌘Q</ui-dropdown-menu-shortcut
          >
        </ui-dropdown-menu-item>
      </ui-dropdown-menu-content>
    </ui-dropdown-menu>
  `,
};
