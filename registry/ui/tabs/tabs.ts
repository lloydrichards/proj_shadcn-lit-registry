import { html, LitElement, nothing, type PropertyValues } from "lit";
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

export interface TabsChangeEvent extends CustomEvent {
  detail: { value: string };
}

export interface TabsProperties {
  value?: string;
  defaultValue?: string;
}

@customElement("ui-tabs")
export class Tabs extends TW(LitElement) implements TabsProperties {
  @property({ type: String }) value = "";
  @property({ type: String, attribute: "default-value" }) defaultValue = "";

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-orientation", "horizontal");

    if (!this.value && this.defaultValue) {
      this.value = this.defaultValue;
    }

    this.addEventListener("tabs-trigger-click", this.handleTriggerClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("tabs-trigger-click", this.handleTriggerClick);
  }

  private handleTriggerClick = (e: CustomEvent) => {
    const newValue = e.detail.value;
    if (newValue !== this.value) {
      this.value = newValue;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: newValue },
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.updateTriggers();
      this.updateContents();
    }
  }

  private updateTriggers() {
    const triggers = Array.from(
      this.querySelectorAll("ui-tabs-trigger"),
    ) as TabsTrigger[];
    triggers.forEach((trigger) => {
      trigger.selected = trigger.value === this.value;
    });
  }

  private updateContents() {
    const contents = Array.from(
      this.querySelectorAll("ui-tabs-content"),
    ) as TabsContent[];
    contents.forEach((content) => {
      content.active = content.value === this.value;
    });
  }

  override render() {
    return html`<slot></slot>`;
  }
}

@customElement("ui-tabs-list")
export class TabsList extends TW(LitElement) {
  @queryAssignedElements({ selector: "ui-tabs-trigger" })
  private triggers!: Array<TabsTrigger>;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "tablist");
    this.setAttribute("data-orientation", "horizontal");
  }

  override firstUpdated() {
    setTimeout(() => {
      this.updateRovingTabindex();
    }, 0);
  }

  private updateRovingTabindex() {
    const enabledTriggers = this.triggers.filter((t) => !t.disabled);
    const selectedIndex = enabledTriggers.findIndex((t) => t.selected);
    const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

    enabledTriggers.forEach((trigger, index) => {
      trigger.tabIndex = index === focusIndex ? 0 : -1;
    });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const triggers = this.triggers.filter((t) => !t.disabled);
    if (triggers.length === 0) return;

    const currentIndex = triggers.findIndex(
      (t) => t === this.shadowRoot?.activeElement,
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        nextIndex = (currentIndex + 1) % triggers.length;
        break;
      case "ArrowLeft":
        e.preventDefault();
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = triggers.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      triggers.forEach((t, i) => {
        t.tabIndex = i === nextIndex ? 0 : -1;
      });
      const button = triggers[nextIndex].shadowRoot?.querySelector("button");
      button?.focus();
      button?.click();
    }
  };

  override render() {
    return html`
      <div
        class=${cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          this.className,
        )}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-tabs-trigger")
export class TabsTrigger extends TW(LitElement) {
  @property({ type: String }) value = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) selected = false;
  @property({ type: Number }) tabIndex = -1;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "tab");
    this.setAttribute("data-orientation", "horizontal");
  }

  private handleClick = () => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("tabs-trigger-click", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("selected")) {
      this.setAttribute("aria-selected", String(this.selected));
      this.setAttribute("data-state", this.selected ? "active" : "inactive");

      const button = this.shadowRoot?.querySelector("button");
      if (button) {
        const tabs = this.closest("ui-tabs");
        const content = tabs?.querySelector(
          `ui-tabs-content[value="${this.value}"]`,
        );
        if (content) {
          button.setAttribute(
            "aria-controls",
            content.id || `content-${this.value}`,
          );
        }
      }
    }

    if (changedProperties.has("disabled")) {
      this.setAttribute("aria-disabled", String(this.disabled));
    }
  }

  override render() {
    return html`
      <button
        type="button"
        class=${cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
          this.className,
        )}
        ?disabled=${this.disabled}
        tabindex=${this.tabIndex}
        data-state=${this.selected ? "active" : "inactive"}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

@customElement("ui-tabs-content")
export class TabsContent extends TW(LitElement) {
  @property({ type: String }) value = "";
  @property({ type: Boolean }) active = false;
  @property({ type: Boolean }) forceMount = false;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "tabpanel");
    this.setAttribute("data-orientation", "horizontal");

    if (!this.id) {
      this.id = `content-${this.value}`;
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("active")) {
      this.setAttribute("data-state", this.active ? "active" : "inactive");

      const tabs = this.closest("ui-tabs");
      const trigger = tabs?.querySelector(
        `ui-tabs-trigger[value="${this.value}"]`,
      );
      if (trigger) {
        this.setAttribute(
          "aria-labelledby",
          trigger.id || `trigger-${this.value}`,
        );
      }
    }
  }

  override render() {
    if (!this.active && !this.forceMount) {
      return nothing;
    }

    return html`
      <div
        class=${cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          this.className,
        )}
        tabindex="0"
        ?hidden=${!this.active}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-tabs": Tabs;
    "ui-tabs-list": TabsList;
    "ui-tabs-trigger": TabsTrigger;
    "ui-tabs-content": TabsContent;
  }

  interface HTMLElementEventMap {
    "tabs-trigger-click": CustomEvent<{ value: string }>;
  }
}
