import "./table";
import "../badge/badge";
import "../button/button";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

/**
 * A responsive table component for displaying tabular data.
 */
const meta: Meta = {
  title: "ui/Table",
  component: "ui-table",
  tags: ["autodocs"],
  argTypes: {},
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj;

/**
 * The default form of the table with all basic elements.
 */
export const Default: Story = {
  render: () => html`
    <ui-table>
      <table>
        <caption>
          A list of your recent invoices.
        </caption>
        <thead>
          <tr>
            <th class="w-[100px]">Invoice</th>
            <th>Status</th>
            <th>Method</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.map(
            (invoice) => html`
              <tr>
                <td class="font-medium">${invoice.invoice}</td>
                <td>${invoice.paymentStatus}</td>
                <td>${invoice.paymentMethod}</td>
                <td class="text-right">${invoice.totalAmount}</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </ui-table>
  `,
};

/**
 * Table with a footer row for displaying totals or summaries.
 */
export const WithFooter: Story = {
  render: () => html`
    <ui-table>
      <table>
        <caption>
          A list of your recent invoices.
        </caption>
        <thead>
          <tr>
            <th class="w-[100px]">Invoice</th>
            <th>Status</th>
            <th>Method</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.slice(0, 3).map(
            (invoice) => html`
              <tr>
                <td class="font-medium">${invoice.invoice}</td>
                <td>${invoice.paymentStatus}</td>
                <td>${invoice.paymentMethod}</td>
                <td class="text-right">${invoice.totalAmount}</td>
              </tr>
            `,
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">Total</td>
            <td class="text-right">$750.00</td>
          </tr>
        </tfoot>
      </table>
    </ui-table>
  `,
};

/**
 * Table with badge components for status indicators.
 */
export const WithBadges: Story = {
  render: () => html`
    <ui-table>
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Status</th>
            <th>Method</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.slice(0, 5).map(
            (invoice) => html`
              <tr>
                <td class="font-medium">${invoice.invoice}</td>
                <td>
                  <ui-badge
                    variant=${invoice.paymentStatus === "Paid"
                      ? "default"
                      : invoice.paymentStatus === "Pending"
                        ? "secondary"
                        : "destructive"}
                  >
                    ${invoice.paymentStatus}
                  </ui-badge>
                </td>
                <td>${invoice.paymentMethod}</td>
                <td class="text-right">${invoice.totalAmount}</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </ui-table>
  `,
};

/**
 * Table with action buttons in cells.
 */
export const WithActions: Story = {
  render: () => html`
    <ui-table>
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Status</th>
            <th>Amount</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.slice(0, 4).map(
            (invoice) => html`
              <tr>
                <td class="font-medium">${invoice.invoice}</td>
                <td>${invoice.paymentStatus}</td>
                <td>${invoice.totalAmount}</td>
                <td class="text-right">
                  <ui-button size="sm" variant="ghost">View</ui-button>
                  <ui-button size="sm" variant="ghost">Edit</ui-button>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </ui-table>
  `,
};

/**
 * Minimal table without caption or footer.
 */
export const Minimal: Story = {
  render: () => html`
    <ui-table>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-medium">John Doe</td>
            <td>john@example.com</td>
            <td>Admin</td>
          </tr>
          <tr>
            <td class="font-medium">Jane Smith</td>
            <td>jane@example.com</td>
            <td>User</td>
          </tr>
          <tr>
            <td class="font-medium">Bob Johnson</td>
            <td>bob@example.com</td>
            <td>User</td>
          </tr>
        </tbody>
      </table>
    </ui-table>
  `,
};

/**
 * Table demonstrating responsive behavior with many columns.
 */
export const Responsive: Story = {
  render: () => html`
    <ui-table>
      <table>
        <caption>
          Scroll horizontally on small screens.
        </caption>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Status</th>
            <th>Date</th>
            <th>Method</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.slice(0, 3).map(
            (invoice) => html`
              <tr>
                <td class="font-medium">${invoice.invoice}</td>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td>${invoice.paymentStatus}</td>
                <td>2024-01-15</td>
                <td>${invoice.paymentMethod}</td>
                <td class="text-right">${invoice.totalAmount}</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </ui-table>
  `,
};

/**
 * Table with checkbox selection in first column.
 * Demonstrates the checkbox styling pattern from shadcn.
 */
export const WithCheckboxes: Story = {
  render: () => html`
    <ui-table>
      <table>
        <thead>
          <tr>
            <th class="w-[50px]">
              <input type="checkbox" role="checkbox" aria-label="Select all" />
            </th>
            <th>Invoice</th>
            <th>Status</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.slice(0, 4).map(
            (invoice) => html`
              <tr>
                <td>
                  <input
                    type="checkbox"
                    role="checkbox"
                    aria-label="Select row"
                  />
                </td>
                <td class="font-medium">${invoice.invoice}</td>
                <td>${invoice.paymentStatus}</td>
                <td class="text-right">${invoice.totalAmount}</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </ui-table>
  `,
};

/**
 * Table demonstrating various text alignment options.
 */
export const TextAlignment: Story = {
  render: () => html`
    <ui-table>
      <table>
        <thead>
          <tr>
            <th class="text-left">Left Aligned</th>
            <th class="text-center">Center Aligned</th>
            <th class="text-right">Right Aligned</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-left">Left content</td>
            <td class="text-center">Center content</td>
            <td class="text-right">Right content</td>
          </tr>
          <tr>
            <td class="text-left">More left</td>
            <td class="text-center">More center</td>
            <td class="text-right">More right</td>
          </tr>
        </tbody>
      </table>
    </ui-table>
  `,
};
