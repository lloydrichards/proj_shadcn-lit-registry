import { cva, type VariantProps } from "class-variance-authority";
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

@customElement("ui-field-set")
export class FieldSet extends BaseElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`
      <fieldset
        part="fieldset"
        data-slot="field-set"
        class=${cn(
          "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
          this.className,
        )}
      >
        <slot></slot>
      </fieldset>
    `;
  }
}

@customElement("ui-field-legend")
export class FieldLegend extends BaseElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String }) variant: "legend" | "label" = "legend";

  override render() {
    return html`
      <legend
        part="legend"
        data-slot="field-legend"
        data-variant=${this.variant}
        class=${cn(
          "mb-3 font-medium data-[variant=legend]:text-base data-[variant=label]:text-sm",
          this.className,
        )}
      >
        <slot></slot>
      </legend>
    `;
  }
}

@customElement("ui-field-group")
export class FieldGroup extends BaseElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  override render() {
    return html`
      <div
        part="group"
        data-slot="field-group"
        class=${cn(
          "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

type FieldVariants = VariantProps<typeof fieldVariants>;

@customElement("ui-field")
export class Field extends BaseElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String }) orientation: FieldVariants["orientation"] =
    "vertical";
  @property({ type: Boolean, reflect: true }) invalid = false;

  private get fieldClasses() {
    return fieldVariants({ orientation: this.orientation });
  }

  override firstUpdated() {
    this.updateAriaAttributes();
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("invalid")) {
      this.updateAriaAttributes();
    }
  }

  private updateAriaAttributes() {
    const description = this.querySelector("ui-field-description");
    const error = this.querySelector("ui-field-error");
    const label = this.querySelector("label");
    const input = this.querySelector("input, textarea, ui-select");

    if (!input) return;

    const ariaIds: string[] = [];

    // Add description ID if present
    if (description?.id) {
      ariaIds.push(description.id);
    }

    // Handle error message with aria-errormessage (best practice for 2025)
    if (error?.id) {
      if (this.invalid) {
        input.setAttribute("aria-errormessage", error.id);
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-errormessage");
        input.removeAttribute("aria-invalid");
      }
    }

    // Set aria-describedby if we have descriptions (for native inputs)
    if (ariaIds.length > 0 && input.tagName !== "UI-SELECT") {
      input.setAttribute("aria-describedby", ariaIds.join(" "));
    } else if (input.tagName !== "UI-SELECT") {
      input.removeAttribute("aria-describedby");
    }

    // Special handling for ui-select component
    if (input.tagName === "UI-SELECT") {
      const select = input;

      // Get label text for aria-label (solves shadow DOM boundary issue)
      const labelText = label?.textContent?.trim();
      if (labelText) {
        select.ariaLabel = labelText;
      }

      // Set aria-invalid on the select host element
      // The Select component will propagate this to the internal button
      if (this.invalid) {
        select.setAttribute("aria-invalid", "true");
      } else {
        select.removeAttribute("aria-invalid");
      }

      // Note: We don't set aria-describedby or aria-errormessage because they
      // reference IDs that won't cross the shadow DOM boundary in most browsers.
      // Future enhancement: Use Reference Target API when widely supported.
    }
  }

  override render() {
    return html`
      <div
        role="group"
        part="field"
        data-slot="field"
        data-orientation=${this.orientation || nothing}
        data-invalid=${this.invalid}
        class=${cn(this.fieldClasses, this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-field-description")
export class FieldDescription extends BaseElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String }) id = `field-description-${crypto.randomUUID()}`;

  override render() {
    return html`
      <p
        id=${this.id}
        part="description"
        data-slot="field-description"
        class=${cn(
          "text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5 [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
          this.className,
        )}
      >
        <slot></slot>
      </p>
    `;
  }
}

@customElement("ui-field-error")
export class FieldError extends BaseElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String }) id = `field-error-${crypto.randomUUID()}`;

  override render() {
    return html`
      <div
        id=${this.id}
        role="alert"
        aria-live="polite"
        part="error"
        data-slot="field-error"
        class=${cn("text-destructive text-sm font-normal", this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-field": Field;
    "ui-field-description": FieldDescription;
    "ui-field-error": FieldError;
    "ui-field-group": FieldGroup;
    "ui-field-legend": FieldLegend;
    "ui-field-set": FieldSet;
  }
}
