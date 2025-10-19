import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import tableSlottedCss from "./table.css?inline";

// Inject global styles for nested table elements
let globalStylesInjected = false;
function injectGlobalTableStyles() {
  if (globalStylesInjected) return;

  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-component", "ui-table");
  styleEl.textContent = tableSlottedCss;
  document.head.appendChild(styleEl);

  globalStylesInjected = true;
}

@customElement("ui-table")
export class Table extends LitElement {
  override connectedCallback() {
    super.connectedCallback();
    injectGlobalTableStyles();
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
