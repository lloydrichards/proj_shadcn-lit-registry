import { cva } from "class-variance-authority";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Check, Minus } from "lucide-static";

export const checkboxVariants = cva(
  "peer size-4 shrink-0 rounded-sm border border-primary shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
);

export interface CheckboxChangeEvent extends CustomEvent {
  detail: { checked: boolean; indeterminate: boolean };
}

export interface CheckboxProperties {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  ariaLabel?: string | null;
  ariaLabelledby?: string | null;
  ariaDescribedby?: string | null;
}

@customElement("ui-checkbox")
export class Checkbox extends TW(LitElement) implements CheckboxProperties {
  static formAssociated = true;
  private internals: ElementInternals;

  @property({ type: Boolean }) checked: boolean | undefined = undefined;
  @property({ type: Boolean, attribute: "default-checked" })
  defaultChecked = false;
  @property({ type: Boolean }) indeterminate = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: String }) name = "";
  @property({ type: String }) value = "on";

  @property({ type: String, attribute: "aria-label" }) accessor ariaLabel:
    | string
    | null = null;
  @property({ type: String, attribute: "aria-labelledby" })
  accessor ariaLabelledby: string | null = null;
  @property({ type: String, attribute: "aria-describedby" })
  accessor ariaDescribedby: string | null = null;

  @state() private _checked = false;

  private _labelClickHandler = (e: Event) => {
    const label = e.currentTarget as HTMLLabelElement;
    if (label.htmlFor === this.id && !this.disabled) {
      e.preventDefault();
      this._handleClick();
    }
  };

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.checked === undefined) {
      this._checked = this.defaultChecked;
    }
    if (this.shadowRoot) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(
        `:host { display: inline-flex; vertical-align: middle; line-height: 1; }`,
      );
      this.shadowRoot.adoptedStyleSheets = [
        ...this.shadowRoot.adoptedStyleSheets,
        sheet,
      ];
    }
    this._setupLabelDelegation();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupLabelDelegation();
  }

  private _setupLabelDelegation() {
    if (!this.id) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    const labels = root.querySelectorAll(
      `label[for="${this.id}"]`,
    ) as NodeListOf<HTMLLabelElement>;
    labels.forEach((label) => {
      label.addEventListener("click", this._labelClickHandler);
    });
  }

  private _cleanupLabelDelegation() {
    if (!this.id) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    const labels = root.querySelectorAll(
      `label[for="${this.id}"]`,
    ) as NodeListOf<HTMLLabelElement>;
    labels.forEach((label) => {
      label.removeEventListener("click", this._labelClickHandler);
    });
  }

  private get isChecked(): boolean {
    return this.checked !== undefined ? this.checked : this._checked;
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has("checked") ||
      changedProperties.has("_checked") ||
      changedProperties.has("indeterminate") ||
      changedProperties.has("disabled")
    ) {
      const state = this.indeterminate
        ? "indeterminate"
        : this.isChecked
          ? "checked"
          : "unchecked";
      this.setAttribute("data-state", state);

      const ariaChecked = this.indeterminate ? "mixed" : String(this.isChecked);
      this.setAttribute("aria-checked", ariaChecked);

      if (this.disabled) {
        this.setAttribute("data-disabled", "");
      } else {
        this.removeAttribute("data-disabled");
      }

      this.internals.setFormValue(this.isChecked ? this.value : null);
    }
  }

  override attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null,
  ) {
    super.attributeChangedCallback(name, _old, value);
    if (name === "id" && _old !== value) {
      this._cleanupLabelDelegation();
      this._setupLabelDelegation();
    }
  }

  private _handleClick() {
    if (this.disabled) return;

    if (this.checked === undefined) {
      this._checked = !this._checked;
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          checked: this.checked !== undefined ? !this.checked : this._checked,
          indeterminate: false,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._handleClick();
    }
  }

  override render() {
    return html`
      <button
        type="button"
        role="checkbox"
        class=${checkboxVariants()}
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-checked=${
          this.indeterminate ? "mixed" : (String(this.isChecked) as "true")
        }
        aria-label=${this.ariaLabel || nothing}
        aria-labelledby=${this.ariaLabelledby || nothing}
        aria-describedby=${this.ariaDescribedby || nothing}
        data-state=${
          this.indeterminate
            ? "indeterminate"
            : this.isChecked
              ? "checked"
              : "unchecked"
        }
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
      >
        <span
          class="flex [&>svg]:size-3 items-center justify-center text-current"
        >
          ${
            this.indeterminate
              ? unsafeSVG(Minus)
              : this.isChecked
                ? unsafeSVG(Check)
                : nothing
          }
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-checkbox": Checkbox;
  }
}
