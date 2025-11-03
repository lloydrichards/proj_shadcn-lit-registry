import { adoptStyles, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import tableSlottedCss from "./table.css?inline";

const tableStyles = unsafeCSS(tableSlottedCss);

@customElement("ui-table")
export class Table extends BaseElement {
  override connectedCallback() {
    super.connectedCallback();
    // Apply additional table-specific styles
    if (this.shadowRoot) {
      adoptStyles(this.shadowRoot, [tableStyles]);
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
