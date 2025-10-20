import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";

export interface SwitchChangeEvent extends CustomEvent {
  detail: { checked: boolean };
}

export interface SwitchProperties {
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
}

@customElement("ui-switch")
export class Switch extends TW(LitElement) implements SwitchProperties {
  static formAssociated = true;
  private internals: ElementInternals;

  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: String }) name = "";
  @property({ type: String }) value = "on";

  @property({ type: Boolean }) checked: boolean | undefined = undefined;
  @property({ type: Boolean, attribute: "default-checked" })
  defaultChecked = false;

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
      this.handleClick();
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
      changedProperties.has("disabled")
    ) {
      const state = this.isChecked ? "checked" : "unchecked";
      this.setAttribute("data-state", state);
      this.setAttribute("aria-checked", String(this.isChecked));

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

  private handleClick() {
    if (this.disabled) return;

    const newChecked =
      this.checked !== undefined ? !this.checked : !this._checked;

    if (this.checked === undefined) {
      this._checked = newChecked;
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          checked: newChecked,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.handleClick();
    }
  }

  override render() {
    return html`
      <button
        type="button"
        role="switch"
        class="peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-checked=${this.isChecked}
        aria-label=${this.ariaLabel || nothing}
        aria-labelledby=${this.ariaLabelledby || nothing}
        aria-describedby=${this.ariaDescribedby || nothing}
        data-state=${this.isChecked ? "checked" : "unchecked"}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <span
          class="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
          data-state=${this.isChecked ? "checked" : "unchecked"}
        ></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-switch": Switch;
  }

  interface HTMLElementEventMap {
    change: SwitchChangeEvent;
  }
}
