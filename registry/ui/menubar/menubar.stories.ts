import "./menubar";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "ui/Menubar",
  component: "ui-menubar",
  tags: ["autodocs"],
  render: () => html`
    <ui-menubar>
      <ui-menubar-menu value="file">
        <ui-menubar-trigger slot="trigger">File</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>
            New File
            <ui-menubar-shortcut slot="shortcut">⌘N</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item>Open</ui-menubar-item>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-item>Save</ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="edit">
        <ui-menubar-trigger slot="trigger">Edit</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>Undo</ui-menubar-item>
          <ui-menubar-item>Redo</ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="view">
        <ui-menubar-trigger slot="trigger">View</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-checkbox-item checked>
            Show Toolbar
          </ui-menubar-checkbox-item>
          <ui-menubar-checkbox-item> Show Sidebar </ui-menubar-checkbox-item>
        </ui-menubar-content>
      </ui-menubar-menu>
    </ui-menubar>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithCheckboxes: Story = {
  render: () => html`
    <ui-menubar>
      <ui-menubar-menu value="view">
        <ui-menubar-trigger slot="trigger">View</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-label>Appearance</ui-menubar-label>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-checkbox-item checked>
            Show Toolbar
          </ui-menubar-checkbox-item>
          <ui-menubar-checkbox-item> Show Sidebar </ui-menubar-checkbox-item>
          <ui-menubar-checkbox-item> Show Footer </ui-menubar-checkbox-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="window">
        <ui-menubar-trigger slot="trigger">Window</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-checkbox-item> Always on Top </ui-menubar-checkbox-item>
          <ui-menubar-checkbox-item checked>
            Full Screen
          </ui-menubar-checkbox-item>
        </ui-menubar-content>
      </ui-menubar-menu>
    </ui-menubar>
  `,
};

export const WithRadioGroups: Story = {
  render: () => html`
    <ui-menubar>
      <ui-menubar-menu value="profiles">
        <ui-menubar-trigger slot="trigger">Profiles</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-radio-group value="andy">
            <ui-menubar-radio-item value="andy">Andy</ui-menubar-radio-item>
            <ui-menubar-radio-item value="benoit">Benoit</ui-menubar-radio-item>
            <ui-menubar-radio-item value="luis">Luis</ui-menubar-radio-item>
          </ui-menubar-radio-group>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-item>Edit...</ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="theme">
        <ui-menubar-trigger slot="trigger">Theme</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-radio-group value="light">
            <ui-menubar-radio-item value="light">Light</ui-menubar-radio-item>
            <ui-menubar-radio-item value="dark">Dark</ui-menubar-radio-item>
            <ui-menubar-radio-item value="system">System</ui-menubar-radio-item>
          </ui-menubar-radio-group>
        </ui-menubar-content>
      </ui-menubar-menu>
    </ui-menubar>
  `,
};

export const WithSubmenu: Story = {
  render: () => html`
    <ui-menubar>
      <ui-menubar-menu value="file">
        <ui-menubar-trigger slot="trigger">File</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>New File</ui-menubar-item>

          <ui-menubar-sub>
            <ui-menubar-sub-trigger slot="trigger">
              Open Recent
            </ui-menubar-sub-trigger>
            <ui-menubar-sub-content slot="content">
              <ui-menubar-item>document.txt</ui-menubar-item>
              <ui-menubar-item>image.png</ui-menubar-item>
              <ui-menubar-item>presentation.pdf</ui-menubar-item>
            </ui-menubar-sub-content>
          </ui-menubar-sub>

          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-item>Save</ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="edit">
        <ui-menubar-trigger slot="trigger">Edit</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>Undo</ui-menubar-item>
          <ui-menubar-item>Redo</ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>
    </ui-menubar>
  `,
};

export const WithShortcuts: Story = {
  render: () => html`
    <ui-menubar>
      <ui-menubar-menu value="file">
        <ui-menubar-trigger slot="trigger">File</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>
            New File
            <ui-menubar-shortcut slot="shortcut">⌘N</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item>
            Open
            <ui-menubar-shortcut slot="shortcut">⌘O</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-item>
            Save
            <ui-menubar-shortcut slot="shortcut">⌘S</ui-menubar-shortcut>
          </ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="edit">
        <ui-menubar-trigger slot="trigger">Edit</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>
            Undo
            <ui-menubar-shortcut slot="shortcut">⌘Z</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item>
            Redo
            <ui-menubar-shortcut slot="shortcut">⌘⇧Z</ui-menubar-shortcut>
          </ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>
    </ui-menubar>
  `,
};

export const Complex: Story = {
  render: () => html`
    <ui-menubar>
      <ui-menubar-menu value="file">
        <ui-menubar-trigger slot="trigger">File</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-group>
            <ui-menubar-item>
              New File
              <ui-menubar-shortcut slot="shortcut">⌘N</ui-menubar-shortcut>
            </ui-menubar-item>
            <ui-menubar-item>
              New Window
              <ui-menubar-shortcut slot="shortcut">⌘⇧N</ui-menubar-shortcut>
            </ui-menubar-item>
          </ui-menubar-group>

          <ui-menubar-separator></ui-menubar-separator>

          <ui-menubar-sub>
            <ui-menubar-sub-trigger slot="trigger">
              Open Recent
            </ui-menubar-sub-trigger>
            <ui-menubar-sub-content slot="content">
              <ui-menubar-item>document.txt</ui-menubar-item>
              <ui-menubar-item>image.png</ui-menubar-item>
              <ui-menubar-separator></ui-menubar-separator>
              <ui-menubar-item>More...</ui-menubar-item>
            </ui-menubar-sub-content>
          </ui-menubar-sub>

          <ui-menubar-separator></ui-menubar-separator>

          <ui-menubar-item>
            Save
            <ui-menubar-shortcut slot="shortcut">⌘S</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item disabled>
            Save As...
            <ui-menubar-shortcut slot="shortcut">⌘⇧S</ui-menubar-shortcut>
          </ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="edit">
        <ui-menubar-trigger slot="trigger">Edit</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-item>
            Undo
            <ui-menubar-shortcut slot="shortcut">⌘Z</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item>
            Redo
            <ui-menubar-shortcut slot="shortcut">⌘⇧Z</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-item>
            Cut
            <ui-menubar-shortcut slot="shortcut">⌘X</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item>
            Copy
            <ui-menubar-shortcut slot="shortcut">⌘C</ui-menubar-shortcut>
          </ui-menubar-item>
          <ui-menubar-item>
            Paste
            <ui-menubar-shortcut slot="shortcut">⌘V</ui-menubar-shortcut>
          </ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="view">
        <ui-menubar-trigger slot="trigger">View</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-label>Appearance</ui-menubar-label>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-checkbox-item checked>
            Show Toolbar
          </ui-menubar-checkbox-item>
          <ui-menubar-checkbox-item> Show Sidebar </ui-menubar-checkbox-item>
        </ui-menubar-content>
      </ui-menubar-menu>

      <ui-menubar-menu value="profiles">
        <ui-menubar-trigger slot="trigger">Profiles</ui-menubar-trigger>
        <ui-menubar-content slot="content">
          <ui-menubar-radio-group value="andy">
            <ui-menubar-radio-item value="andy">Andy</ui-menubar-radio-item>
            <ui-menubar-radio-item value="benoit">Benoit</ui-menubar-radio-item>
            <ui-menubar-radio-item value="luis">Luis</ui-menubar-radio-item>
          </ui-menubar-radio-group>
          <ui-menubar-separator></ui-menubar-separator>
          <ui-menubar-item>Edit...</ui-menubar-item>
        </ui-menubar-content>
      </ui-menubar-menu>
    </ui-menubar>
  `,
};
