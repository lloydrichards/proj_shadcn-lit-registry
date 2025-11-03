import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ChevronDown } from "lucide-static";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

/**
 * Accordion component properties and events
 */
export interface AccordionProperties {
  type?: "single" | "multiple";
  value?: string;
  defaultValue?: string;
  collapsible?: boolean;
  disabled?: boolean;
}

export interface AccordionItemProperties {
  value: string;
  disabled?: boolean;
}

export interface AccordionTriggerProperties {
  disabled?: boolean;
}

export interface AccordionContentProperties {
  forceMount?: boolean;
}

export interface AccordionValueChangeEvent extends CustomEvent {
  detail: { value: string | string[] };
}

/**
 * Root accordion container managing state
 */
@customElement("ui-accordion")
export class Accordion extends BaseElement implements AccordionProperties {
  @property({ type: String }) type: "single" | "multiple" = "single";
  @property({ type: String }) value = "";
  @property({ type: String, attribute: "default-value" }) defaultValue = "";
  @property({ type: Boolean }) collapsible = false;
  @property({ type: Boolean }) disabled = false;

  @state() _openValues: Set<string> = new Set();

  override connectedCallback() {
    super.connectedCallback();

    // Initialize from defaultValue
    if (!this.value && this.defaultValue) {
      this.value = this.defaultValue;
    }

    this.addEventListener(
      "accordion-trigger-click",
      this.handleTriggerClick as EventListener,
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      "accordion-trigger-click",
      this.handleTriggerClick as EventListener,
    );
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has("value") ||
      changedProperties.has("_openValues")
    ) {
      this.updateItems();
      this.dispatchValueChangeEvent();
    }
  }

  private handleTriggerClick = (e: CustomEvent) => {
    if (this.disabled) return;

    const clickedValue = e.detail.value;

    if (this.type === "single") {
      // Single mode: toggle or switch active item
      if (this.collapsible && this.value === clickedValue) {
        this.value = "";
      } else {
        this.value = clickedValue;
      }
    } else {
      // Multiple mode: toggle in Set
      const newValues = new Set(this._openValues);
      if (newValues.has(clickedValue)) {
        newValues.delete(clickedValue);
      } else {
        newValues.add(clickedValue);
      }
      this._openValues = newValues;
    }
  };

  private dispatchValueChangeEvent() {
    const value =
      this.type === "single" ? this.value : Array.from(this._openValues);

    this.emit("value-change", { value });
  }

  private updateItems() {
    const items = Array.from(
      this.querySelectorAll("ui-accordion-item"),
    ) as AccordionItem[];

    items.forEach((item) => {
      if (this.type === "single") {
        item._open = item.value === this.value;
      } else {
        item._open = this._openValues.has(item.value);
      }
    });
  }

  override render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }
}

/**
 * Individual accordion item
 */
@customElement("ui-accordion-item")
export class AccordionItem
  extends BaseElement
  implements AccordionItemProperties
{
  @property({ type: String }) value = "";
  @property({ type: Boolean }) disabled = false;

  @state() _open = false;

  override connectedCallback() {
    super.connectedCallback();

    // Sync with parent on mount
    const accordion = this.closest("ui-accordion") as Accordion | null;
    if (accordion) {
      this._open =
        accordion.type === "single"
          ? accordion.value === this.value
          : accordion._openValues?.has(this.value) || false;
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("_open")) {
      this.updateChildren();
      this.setAttribute("data-state", this._open ? "open" : "closed");
    }
  }

  private updateChildren() {
    const trigger = this.querySelector(
      "ui-accordion-trigger",
    ) as AccordionTrigger | null;
    const content = this.querySelector(
      "ui-accordion-content",
    ) as AccordionContent | null;

    if (trigger) trigger._open = this._open;
    if (content) content._open = this._open;
  }

  override render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div
        class=${cn("border-b last:border-b-0", this.className)}
        data-state=${this._open ? "open" : "closed"}
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Accordion trigger button
 */
@customElement("ui-accordion-trigger")
export class AccordionTrigger
  extends BaseElement
  implements AccordionTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  @state() _open = false;

  contentId = `accordion-content-${Math.random().toString(36).substring(2, 11)}`;

  override connectedCallback() {
    super.connectedCallback();

    // Sync initial state
    const item = this.closest("ui-accordion-item") as AccordionItem | null;
    if (item) {
      this._open = item._open;
    }
  }

  private handleClick = () => {
    const accordion = this.closest("ui-accordion") as Accordion | null;
    const item = this.closest("ui-accordion-item") as AccordionItem | null;

    if (
      !accordion ||
      !item ||
      this.disabled ||
      item.disabled ||
      accordion.disabled
    ) {
      return;
    }

    this.emit("accordion-trigger-click", { value: item.value });
  };

  override render() {
    const iconHtml = ChevronDown.replace(
      "<svg",
      '<svg class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"',
    );

    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h3 class="flex">
        <button
          type="button"
          aria-expanded=${this._open}
          aria-controls=${this.contentId}
          class=${cn(
            "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:pointer-events-none disabled:opacity-50",
            "[&[data-state=open]>svg]:rotate-180",
            this.className,
          )}
          ?disabled=${this.disabled}
          data-state=${this._open ? "open" : "closed"}
          @click=${this.handleClick}
        >
          <slot></slot>
          ${unsafeSVG(iconHtml)}
        </button>
      </h3>
    `;
  }
}

/**
 * Accordion content area
 */
@customElement("ui-accordion-content")
export class AccordionContent
  extends BaseElement
  implements AccordionContentProperties
{
  @property({ type: Boolean }) forceMount = false;

  @state() _open = false;
  @state() private _animationState: "closed" | "opening" | "open" | "closing" =
    "closed";
  @state() private _hasRenderedOnce = false;

  private _contentId =
    `accordion-content-${Math.random().toString(36).substring(2, 11)}`;

  override connectedCallback() {
    super.connectedCallback();

    // Sync initial state
    const item = this.closest("ui-accordion-item") as AccordionItem | null;
    if (item) {
      this._open = item._open;
      // Set initial animation state without triggering animation
      this._animationState = this._open ? "open" : "closed";
    }
  }

  override firstUpdated() {
    // Link to trigger (one-time setup)
    const item = this.closest("ui-accordion-item") as AccordionItem | null;
    const trigger = item?.querySelector(
      "ui-accordion-trigger",
    ) as AccordionTrigger | null;
    if (trigger) {
      this.id = trigger.contentId;
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("_open")) {
      this.handleOpenStateChange();
    }
  }

  private handleOpenStateChange() {
    if (this._open) {
      // Opening
      if (!this._hasRenderedOnce) {
        // First render: skip animation
        this._animationState = "open";
      } else {
        this._animationState = "opening";
      }
    } else {
      // Closing (only if currently open or opening)
      if (
        this._animationState === "open" ||
        this._animationState === "opening"
      ) {
        this._animationState = "closing";
      }
    }

    this.updateContentHeight();
  }

  private updateContentHeight() {
    // Wait for render to complete
    this.updateComplete.then(() => {
      const regionDiv = this.shadowRoot?.querySelector("[role='region']") as
        | (HTMLElement & { _accordionAnimationHandler?: EventListener })
        | null;

      if (!regionDiv) return;

      // Calculate content height for animation variable
      const innerDiv = regionDiv.querySelector("div") as HTMLElement | null;
      if (innerDiv) {
        const height = innerDiv.scrollHeight;
        regionDiv.style.setProperty(
          "--accordion-content-height",
          `${height}px`,
        );
      }

      // Clean up previous listener if it exists
      if (regionDiv._accordionAnimationHandler) {
        regionDiv.removeEventListener(
          "animationend",
          regionDiv._accordionAnimationHandler,
        );
      }

      // Create new listener
      const handleAnimationEnd = () => {
        if (this._animationState === "opening") {
          this._animationState = "open";
        } else if (this._animationState === "closing") {
          this._animationState = "closed";
        }
      };

      regionDiv._accordionAnimationHandler = handleAnimationEnd;
      regionDiv.addEventListener("animationend", handleAnimationEnd, {
        once: true, // Auto-remove after first fire
      });
    });
  }

  override render() {
    // Mark that we've rendered at least once
    this._hasRenderedOnce = true;

    // Render if not fully closed (or if forceMount enabled)
    if (this._animationState === "closed" && !this.forceMount) {
      return nothing;
    }

    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div
        role="region"
        id=${this._contentId}
        class=${cn(
          "overflow-hidden text-sm",
          this._animationState === "opening" && "animate-accordion-down",
          this._animationState === "closing" && "animate-accordion-up",
          this.className,
        )}
        data-state=${this._open ? "open" : "closed"}
      >
        <div class="pt-0 pb-4">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

// Register components in global type map
declare global {
  interface HTMLElementTagNameMap {
    "ui-accordion": Accordion;
    "ui-accordion-item": AccordionItem;
    "ui-accordion-trigger": AccordionTrigger;
    "ui-accordion-content": AccordionContent;
  }

  interface HTMLElementEventMap {
    "value-change": AccordionValueChangeEvent;
    "accordion-trigger-click": CustomEvent<{ value: string }>;
  }
}
