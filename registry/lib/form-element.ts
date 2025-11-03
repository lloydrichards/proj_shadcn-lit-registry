/**
 * FormElement - Base class for form-participating components
 *
 * Features:
 * 1. Native form participation via ElementInternals
 * 2. Validation API (checkValidity, reportValidity, setCustomValidity)
 * 3. Form submission and reset support
 * 4. Accessible by default with ARIA attributes
 */

import type { PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { BaseElement } from "./base-element";

/**
 * Type for values that can be serialized in forms
 */
export type FormValue = string | number | boolean | null;

/**
 * Types of validation errors
 */
export type ValidationType = "valueMissing" | "custom";

export interface FormElementProperties {
  name?: string;
  value?: FormValue;
  defaultValue?: FormValue;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  form?: string;
  validationMessages?: Partial<Record<ValidationType, string>>;
}

export abstract class FormElement
  extends BaseElement
  implements FormElementProperties
{
  // Enable native form participation (where supported)
  static formAssociated = true;

  // ElementInternals for native form participation
  protected internals?: ElementInternals;

  // Form element reference
  private _form: HTMLFormElement | null = null;

  // Form properties
  @property({ type: String }) name = "";
  @property() value: FormValue = "";
  @property() defaultValue: FormValue = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: String }) form = "";
  @property({ type: Object }) validationMessages?: Partial<
    Record<ValidationType, string>
  >;

  // Validity state
  protected validationMessage = "";
  protected isValid = true;

  constructor() {
    super();

    // Attach ElementInternals if available
    if ("attachInternals" in this) {
      this.internals = this.attachInternals();
    }
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set default value on first connection
    if (this.defaultValue === "") {
      this.defaultValue = this.value;
    }

    // Find and attach to form
    this._form = this._findForm();
    if (this._form) {
      this._form.addEventListener("submit", this._handleFormSubmit);
      this._form.addEventListener("reset", this._handleFormReset);
    }

    // Update form value
    this.updateFormValue();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Cleanup form listeners
    if (this._form) {
      this._form.removeEventListener("submit", this._handleFormSubmit);
      this._form.removeEventListener("reset", this._handleFormReset);
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // Update form value when value changes
    if (changedProperties.has("value")) {
      this.updateFormValue();
      this.checkValidity();
    }

    // Update validity when validation props change
    if (
      changedProperties.has("required") ||
      changedProperties.has("disabled")
    ) {
      this.checkValidity();
    }
  }

  /**
   * Find the form this element belongs to
   */
  private _findForm(): HTMLFormElement | null {
    // Check for form attribute (allows associating with a form by ID)
    if (this.form) {
      return document.getElementById(this.form) as HTMLFormElement;
    }

    // Use ElementInternals.form if available (preferred)
    if (this.internals?.form) {
      return this.internals.form;
    }

    // Fallback to closest form ancestor
    return this.closest("form");
  }

  /**
   * Handle form submission - validate before allowing submit
   */
  private _handleFormSubmit = (event: Event) => {
    if (!this.reportValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  /**
   * Handle form reset - restore default value
   */
  private _handleFormReset = () => {
    this.reset();
  };

  /**
   * Check if a value is serializable for forms
   */
  private isSerializable(value: unknown): value is FormValue {
    if (value === null) return true;
    const type = typeof value;
    return type === "string" || type === "number" || type === "boolean";
  }

  /**
   * Update the form value using ElementInternals or hidden input
   */
  protected updateFormValue() {
    const formValue = this.disabled ? null : this.value;

    if (!this.isSerializable(formValue)) {
      console.warn(
        `FormElement "${this.name}": value must be string, number, boolean, or null, got ${typeof formValue}`,
      );
      return;
    }

    if (this.internals) {
      // Use native form participation
      if (formValue === null || formValue === undefined) {
        this.internals.setFormValue(null);
      } else {
        this.internals.setFormValue(String(formValue));
      }
    }
  }

  /**
   * Get localized validation message
   */
  private getValidationMessage(type: ValidationType): string {
    const custom = this.validationMessages?.[type];
    if (custom) return custom;

    switch (type) {
      case "valueMissing":
        return "Please fill out this field.";
      case "custom":
        return this.validationMessage;
      default:
        return "";
    }
  }

  /**
   * Check validity without showing error message
   */
  checkValidity(): boolean {
    if (this.disabled) {
      this.isValid = true;
      this.validationMessage = "";
      return true;
    }

    // Check custom validity first (if set, it takes precedence)
    if (this.validationMessage && !this.isValid) {
      // Custom validity is already set, don't override
      return false;
    }

    // Check required
    if (this.required && !this.value) {
      this.isValid = false;
      this.validationMessage = this.getValidationMessage("valueMissing");
    } else {
      this.isValid = true;
      this.validationMessage = "";
    }

    // Update ElementInternals validity
    if (this.internals) {
      if (this.isValid) {
        this.internals.setValidity({});
      } else {
        this.internals.setValidity(
          { valueMissing: this.required && !this.value },
          this.validationMessage,
        );
      }
    }

    return this.isValid;
  }

  /**
   * Check validity and show error message
   */
  reportValidity(): boolean {
    const isValid = this.checkValidity();

    if (!isValid) {
      this.emit("invalid", {
        message: this.validationMessage,
        validity: this.validity,
      });

      // Could also show a tooltip or other UI here
      this.internals?.reportValidity();
    }

    return isValid;
  }

  /**
   * Set a custom validation message
   */
  setCustomValidity(message: string): void {
    this.validationMessage = message;
    this.isValid = !message;

    if (this.internals) {
      if (message) {
        this.internals.setValidity({ customError: true }, message);
      } else {
        this.internals.setValidity({});
      }
    }
  }

  /**
   * Get validity state
   */
  get validity(): ValidityState {
    if (this.internals) {
      return this.internals.validity;
    }

    // Polyfill ValidityState
    return {
      badInput: false,
      customError: !!this.validationMessage,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valid: this.isValid,
      valueMissing: this.required && !this.value,
    } as ValidityState;
  }

  /**
   * Reset to default value
   */
  reset(): void {
    this.value = this.defaultValue;
    this.validationMessage = "";
    this.isValid = true;
    this.requestUpdate();
  }

  /**
   * Get the form element this control belongs to
   */
  get formElement(): HTMLFormElement | null {
    if (this.internals) {
      return this.internals.form;
    }

    if (this.form) {
      return document.getElementById(this.form) as HTMLFormElement;
    }

    return this.closest("form");
  }

  /**
   * Focus the primary input/control element
   * Should focus the internal focusable element (shadow DOM or light DOM),
   * not the custom element itself
   *
   * @example
   * focus(options?: FocusOptions) {
   *   this._input?.focus(options);
   * }
   */
  abstract focus(options?: FocusOptions): void;

  /**
   * Remove focus from the control
   *
   * @example
   * blur() {
   *   this._input?.blur();
   * }
   */
  abstract blur(): void;

  /**
   * Helper to focus an element with enhanced semantics
   * @protected
   */
  protected focusElement(
    element: HTMLElement | null | undefined,
    options?: FocusOptions,
  ) {
    if (element) {
      element.focus(options);
    }
  }

  /**
   * Helper to blur an element
   * @protected
   */
  protected blurElement(element: HTMLElement | null | undefined) {
    if (element) {
      element.blur();
    }
  }
}

export default FormElement;
