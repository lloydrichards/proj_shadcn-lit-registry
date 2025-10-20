import "./field";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

/**
 * Combine labels, controls, and help text to compose accessible form fields and grouped inputs.
 */
const meta: Meta = {
  title: "ui/Field",
  component: "ui-field",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

/**
 * Field with Input component for text input.
 */
export const WithInput: Story = {
  render: () => html`
    <ui-field-set class="w-96">
      <ui-field-group>
        <ui-field>
          <label for="username" class="text-sm font-medium">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Max Leiter"
          ></input>
          <ui-field-description>
            Choose a unique username for your account.
          </ui-field-description>
        </ui-field>
      </ui-field-group>
    </ui-field-set>
  `,
};

/**
 * Field with error state.
 */
export const WithError: Story = {
  render: () => html`
    <ui-field-set class="w-96">
      <ui-field-group>
        <ui-field .invalid=${true}>
          <label for="email-error" class="text-sm font-medium">Email</label>
          <input
            id="email-error"
            type="email"
            placeholder="email@example.com"
          ></input>
          <ui-field-error>Please enter a valid email address.</ui-field-error>
        </ui-field>
      </ui-field-group>
    </ui-field-set>
  `,
};

/**
 * FieldSet with multiple related fields.
 */
export const WithFieldset: Story = {
  render: () => html`
    <ui-field-set class="w-96">
      <ui-field-legend>Address Information</ui-field-legend>
      <ui-field-description>
        We need your address to deliver your order.
      </ui-field-description>
      <ui-field-group>
        <ui-field>
          <label for="street" class="text-sm font-medium">Street Address</label>
          <input
            id="street"
            type="text"
            placeholder="123 Main St"
          ></input>
        </ui-field>
        <div class="grid grid-cols-2 gap-4">
          <ui-field>
            <label for="city" class="text-sm font-medium">City</label>
            <input id="city" type="text" placeholder="New York"></input>
          </ui-field>
          <ui-field>
            <label for="zip" class="text-sm font-medium">Postal Code</label>
            <input id="zip" type="text" placeholder="90502"></input>
          </ui-field>
        </div>
      </ui-field-group>
    </ui-field-set>
  `,
};
