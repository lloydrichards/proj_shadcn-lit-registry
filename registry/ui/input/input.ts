import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

const TwLitElement = TW(LitElement);

export const inputStyles =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

@customElement("ui-input")
export class Input extends TwLitElement {
  @property({ type: String }) type = "text";
  @property({ type: String }) placeholder = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) value = "";
  @property({ type: String }) name = "";

  override render() {
    return html`
      <input
        type=${this.type as "text"}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        .value=${this.value}
        name=${this.name}
        class=${cn(inputStyles, this.className)}
        @input=${this._handleInput}
      />
    `;
  }

  private _handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: target.value },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-input": Input;
  }
}
