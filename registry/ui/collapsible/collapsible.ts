import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

const TwLitElement = TW(LitElement);

/**
 * Collapsible component properties and events
 */
export interface CollapsibleProperties {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
}

export interface CollapsibleTriggerProperties {
  disabled?: boolean;
}

export interface CollapsibleContentProperties {
  forceMount?: boolean;
}

export interface CollapsibleOpenChangeEvent extends CustomEvent {
  detail: { open: boolean };
}

/**
 * Root collapsible container managing state
 */
@customElement("ui-collapsible")
export class Collapsible extends TwLitElement implements CollapsibleProperties {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen = false;
  @property({ type: Boolean }) disabled = false;

  override connectedCallback() {
    super.connectedCallback();

    // Initialize from defaultOpen
    if (this.defaultOpen && !this.hasAttribute("open")) {
      this.open = this.defaultOpen;
    }

    this.addEventListener(
      "collapsible-trigger-click",
      this.handleTriggerClick as EventListener,
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      "collapsible-trigger-click",
      this.handleTriggerClick as EventListener,
    );
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      this.updateContent();

      this.dispatchEvent(
        new CustomEvent("open-change", {
          detail: { open: this.open },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleTriggerClick = () => {
    if (!this.disabled) {
      this.open = !this.open;
    }
  };

  private updateContent() {
    const content = this.querySelector(
      "ui-collapsible-content",
    ) as CollapsibleContent | null;
    if (content) {
      content._open = this.open;
    }
  }

  /**
   * Public method to toggle open/closed state
   */
  public toggle() {
    if (!this.disabled) {
      this.open = !this.open;
    }
  }

  /**
   * Public method to open the collapsible
   */
  public show() {
    if (!this.disabled) {
      this.open = true;
    }
  }

  /**
   * Public method to close the collapsible
   */
  public hide() {
    if (!this.disabled) {
      this.open = false;
    }
  }

  override render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div data-state=${this.open ? "open" : "closed"}>
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Collapsible trigger button (unstyled)
 */
@customElement("ui-collapsible-trigger")
export class CollapsibleTrigger
  extends TwLitElement
  implements CollapsibleTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  private handleClick = () => {
    const collapsible = this.closest("ui-collapsible") as Collapsible | null;

    if (!collapsible || this.disabled || collapsible.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("collapsible-trigger-click", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  override render() {
    const collapsible = this.closest("ui-collapsible") as Collapsible | null;
    const isOpen = collapsible?.open || false;

    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div @click=${this.handleClick} data-state=${isOpen ? "open" : "closed"}>
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Collapsible content area
 */
@customElement("ui-collapsible-content")
export class CollapsibleContent
  extends TwLitElement
  implements CollapsibleContentProperties
{
  @property({ type: Boolean }) forceMount = false;

  @state() _open = false;
  @state() private _animationState: "closed" | "opening" | "open" | "closing" =
    "closed";
  @state() private _hasRenderedOnce = false;

  private observer?: MutationObserver;

  override connectedCallback() {
    super.connectedCallback();

    // Sync with parent
    const collapsible = this.closest("ui-collapsible") as Collapsible | null;
    if (collapsible) {
      this._open = collapsible.open;
      // Set initial animation state without triggering animation
      this._animationState = this._open ? "open" : "closed";

      // Observe parent for changes
      this.observer = new MutationObserver(() => {
        this._open = collapsible.open;
      });
      this.observer.observe(collapsible, {
        attributes: true,
        attributeFilter: ["open"],
      });
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
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
        | (HTMLElement & { _collapsibleAnimationHandler?: EventListener })
        | null;

      if (!regionDiv) return;

      // Calculate content height for animation variable
      const height = regionDiv.scrollHeight;
      regionDiv.style.setProperty(
        "--collapsible-content-height",
        `${height}px`,
      );

      // Clean up previous listener if it exists
      if (regionDiv._collapsibleAnimationHandler) {
        regionDiv.removeEventListener(
          "animationend",
          regionDiv._collapsibleAnimationHandler,
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

      regionDiv._collapsibleAnimationHandler = handleAnimationEnd;
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

    const collapsible = this.closest("ui-collapsible") as Collapsible | null;
    const triggerId = collapsible
      ?.querySelector("ui-collapsible-trigger")
      ?.getAttribute("id");

    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div
        role="region"
        aria-labelledby=${triggerId || nothing}
        class=${cn(
          "overflow-hidden",
          this._animationState === "opening" && "animate-collapsible-down",
          this._animationState === "closing" && "animate-collapsible-up",
          this.className,
        )}
        data-state=${this._open ? "open" : "closed"}
      >
        <slot></slot>
      </div>
    `;
  }
}

// Register components in global type map
declare global {
  interface HTMLElementTagNameMap {
    "ui-collapsible": Collapsible;
    "ui-collapsible-trigger": CollapsibleTrigger;
    "ui-collapsible-content": CollapsibleContent;
  }

  interface HTMLElementEventMap {
    "open-change": CollapsibleOpenChangeEvent;
    "collapsible-trigger-click": CustomEvent<Record<string, never>>;
  }
}
