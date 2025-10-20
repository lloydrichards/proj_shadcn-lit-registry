import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { tailwind } from "@/registry/lib/tailwindMixin";
import tableSlottedCss from "./table.css?inline";

const tableStyles = unsafeCSS(tableSlottedCss);

@customElement("ui-table")
export class Table extends LitElement {
  override connectedCallback() {
    super.connectedCallback();
    if (this.shadowRoot) {
      adoptStyles(this.shadowRoot, [tailwind, tableStyles]);
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-table": Table;
  }
}
