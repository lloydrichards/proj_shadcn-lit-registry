import { html, LitElement, nothing, type PropertyValues } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Check, ChevronDown } from "lucide-static";
import { ClickAwayController } from "@/controllers/click-away-controller";
import { MenuNavigationController } from "@/controllers/menu-navigation-controller";
import { TW } from "@/registry/lib/tailwindMixin";

export interface SelectChangeEvent extends CustomEvent {
  detail: { value: string };
}

export interface SelectProperties {
  value?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  open?: boolean;
}

@customElement("ui-select")
export class Select extends TW(LitElement) implements SelectProperties {
  static formAssociated = true;
  private internals: ElementInternals;

  @property({ type: String }) value = "";
  @property({ type: String }) name = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String, attribute: "aria-label", reflect: true })
  ariaLabel: string | null = null;
  @property({ type: String, attribute: "aria-invalid", reflect: true })
  ariaInvalid: string | null = null;

  @query("ui-select-trigger") triggerElement?: HTMLElement;
  @query("ui-popover") popupElement?: HTMLElement;

  // Click-away controller
  private clickAway = new ClickAwayController(this, {
    onClickAway: () => {
      this.open = false;
    },
    isActive: () => this.open,
    excludeElements: () => {
      return this.popupElement ? [this.popupElement] : [];
    },
  });

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override firstUpdated() {
    setTimeout(() => {
      this.updateTriggerAttributes();
      this.updateTriggerAriaExpanded();
    }, 0);
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("trigger-click", this.handleTriggerClick);
    this.addEventListener("select-item-click", this.handleItemClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("trigger-click", this.handleTriggerClick);
    this.removeEventListener("select-item-click", this.handleItemClick);
  }

  private handleItemClick = (e: CustomEvent) => {
    e.stopPropagation();
    const newValue = e.detail.value;
    const oldValue = this.value;

    if (newValue !== oldValue) {
      this.value = newValue;
      this.internals.setFormValue(newValue);

      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: newValue },
          bubbles: true,
          composed: true,
        }),
      );
    }

    this.open = false;
  };

  private handleTriggerClick = (e: Event) => {
    e.stopPropagation();
    if (!this.disabled) {
      this.open = !this.open;
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;

    if (
      e.target instanceof HTMLElement &&
      e.target.tagName === "UI-SELECT-CONTENT"
    ) {
      if (e.key === "Escape") {
        e.preventDefault();
        this.open = false;
        const trigger = this.querySelector("ui-select-trigger");
        const button = trigger?.shadowRoot?.querySelector("button");
        button?.focus();
      }
      return;
    }

    switch (e.key) {
      case "Enter":
      case " ":
        if (!this.open) {
          e.preventDefault();
          this.open = true;
        }
        break;
      case "Escape":
        if (this.open) {
          e.preventDefault();
          this.open = false;
          const trigger = this.querySelector("ui-select-trigger");
          const button = trigger?.shadowRoot?.querySelector("button");
          button?.focus();
        }
        break;
      case "ArrowDown":
      case "ArrowUp":
        if (!this.open) {
          e.preventDefault();
          this.open = true;
        }
        break;
    }
  };

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.internals.setFormValue(this.value);
    }

    if (changedProperties.has("open")) {
      this.updateTriggerAriaExpanded();
      this.clickAway.update();

      if (this.open) {
        const contentElement = this.querySelector("ui-select-content");

        setTimeout(() => {
          const listbox =
            contentElement?.shadowRoot?.querySelector<HTMLElement>(
              '[role="listbox"]',
            );
          listbox?.focus();
        }, 0);
      }
    }

    if (
      changedProperties.has("disabled") ||
      changedProperties.has("ariaLabel") ||
      changedProperties.has("ariaInvalid")
    ) {
      setTimeout(() => {
        this.updateTriggerAttributes();
      }, 0);
    }
  }

  private updateTriggerAriaExpanded() {
    const trigger = this.querySelector("ui-select-trigger");
    const button = trigger?.shadowRoot?.querySelector("button");
    if (button) {
      button.setAttribute("aria-expanded", String(this.open));
    }
  }

  private updateTriggerAttributes() {
    const trigger = this.querySelector("ui-select-trigger");
    const button = trigger?.shadowRoot?.querySelector("button");
    if (button) {
      if (this.ariaLabel) {
        button.setAttribute("aria-label", this.ariaLabel);
      } else {
        button.removeAttribute("aria-label");
      }

      if (this.ariaInvalid) {
        button.setAttribute("aria-invalid", this.ariaInvalid);
      } else {
        button.removeAttribute("aria-invalid");
      }

      button.disabled = this.disabled;
    }
  }

  formResetCallback() {
    this.value = "";
  }

  formStateRestoreCallback(state: string) {
    this.value = state;
  }

  override render() {
    return html`
      <ui-popover
        .active=${this.open}
        .anchor=${this.triggerElement}
        placement="bottom-start"
        .distance=${8}
        flip
        shift
        @keydown=${this.handleKeyDown}
        @blur=${(e: FocusEvent) => {
          if (!this.contains(e.relatedTarget as Node)) {
            this.open = false;
          }
        }}
      >
        <slot name="trigger" slot="anchor"></slot>
        <slot name="content"></slot>
      </ui-popover>
    `;
  }
}

@customElement("ui-select-trigger")
export class SelectTrigger extends TW(LitElement) {
  @property({ type: Boolean }) disabled = false;

  private handleButtonClick = (e: Event) => {
    if (this.disabled) return;
    e.preventDefault();
    this.dispatchEvent(
      new CustomEvent("trigger-click", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  override render() {
    return html`
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        ?disabled=${this.disabled}
        @click=${this.handleButtonClick}
      >
        <slot></slot>
        <span class="opacity-50" aria-hidden="true">
          ${unsafeSVG(ChevronDown)}
        </span>
      </button>
    `;
  }
}

@customElement("ui-select-value")
export class SelectValue extends TW(LitElement) {
  @property({ type: String }) placeholder = "Select...";
  @state() private selectedText = "";

  connectedCallback() {
    super.connectedCallback();
    this.updateSelectedText();
    this.addEventListener("value-changed", this.updateSelectedText);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("value-changed", this.updateSelectedText);
  }

  private updateSelectedText = () => {
    const select = this.closest("ui-select");
    if (!select) return;

    const items = Array.from(select.querySelectorAll("ui-select-item"));
    const selectedItem = items.find((item) => item.value === select.value);

    this.selectedText = selectedItem?.textContent?.trim() || "";
  };

  override render() {
    const hasValue = this.selectedText !== "";

    return html`
      <span class=${hasValue ? "" : "text-muted-foreground"}>
        ${hasValue ? this.selectedText : this.placeholder}
      </span>
    `;
  }
}

@customElement("ui-select-content")
export class SelectContent extends TW(LitElement) {
  @state() private isOpen = false;
  @state() private highlightedIndex = -1;
  @state() private triggerWidth = "auto";

  @queryAssignedElements({ selector: "ui-select-item" })
  items!: Array<SelectItem>;

  // Menu navigation controller
  private navigation = new MenuNavigationController(this, {
    getItems: () => this.getNavigableItems(),
    getHighlightedIndex: () => this.highlightedIndex,
    setHighlightedIndex: (index) => {
      this.highlightedIndex = index;
    },
    onSelect: (item) => {
      const div =
        item.shadowRoot?.querySelector<HTMLElement>('[role="option"]');
      if (div) {
        div.click();
      } else {
        item.dispatchEvent(
          new CustomEvent("select-item-click", {
            detail: { value: (item as SelectItem).value },
            bubbles: true,
            composed: true,
          }),
        );
      }
    },
    onEscape: () => {
      const select = this.closest("ui-select");
      if (select) {
        select.open = false;
        const trigger = select.querySelector("ui-select-trigger");
        const button = trigger?.shadowRoot?.querySelector("button");
        button?.focus();
      }
    },
  });

  connectedCallback() {
    super.connectedCallback();
    this.updateOpenState();
    this.updateTriggerWidth();
    this.addEventListener("slotchange", this.handleSlotChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("slotchange", this.handleSlotChange);
  }

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    // Update highlighted state when index changes
    if (changed.has("highlightedIndex")) {
      const items = this.getNavigableItems();
      items.forEach((item, index) => {
        if (index === this.highlightedIndex) {
          item.highlighted = true;
          item.scrollIntoView({ block: "nearest" });
        } else {
          item.highlighted = false;
        }
      });
    }
  }

  updated(changed: PropertyValues) {
    super.updated(changed);

    // Reset navigation state when menu closes
    if (changed.has("isOpen") && !this.isOpen) {
      this.navigation.reset();
    }
  }

  private handleSlotChange = () => {
    this.requestUpdate();
  };

  private updateTriggerWidth() {
    const select = this.closest("ui-select");
    if (!select) return;

    const trigger = select.querySelector("ui-select-trigger");
    if (trigger) {
      const width = trigger.getBoundingClientRect().width;
      this.triggerWidth = `${width}px`;
    }
  }

  private updateOpenState() {
    const select = this.closest("ui-select");
    if (!select) return;

    const observer = new MutationObserver(() => {
      this.isOpen = select.open;
      if (this.isOpen) {
        this.updateHighlightedIndex();
        this.updateTriggerWidth();
      }
    });

    observer.observe(select, { attributes: true, attributeFilter: ["open"] });
    this.isOpen = select.open;
  }

  private updateHighlightedIndex() {
    const select = this.closest("ui-select");
    if (!select) return;

    const items = this.getNavigableItems();
    const selectedIndex = items.findIndex(
      (item) => item.value === select.value,
    );
    this.highlightedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  }

  private getNavigableItems(): SelectItem[] {
    return this.items.filter((item) => !item.disabled);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.navigation.handleKeyDown(e);
  };

  override render() {
    if (!this.isOpen) return nothing;

    return html`
      <div
        role="listbox"
        tabindex="0"
        style="width: ${this.triggerWidth};"
        class="overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80"
        @keydown=${this.handleKeyDown}
      >
        <div class="max-h-[300px] overflow-y-auto p-1">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

@customElement("ui-select-item")
export class SelectItem extends TW(LitElement) {
  @property({ type: String }) value = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) highlighted = false;

  private handleClick = () => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("select-item-click", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );

    const select = this.closest("ui-select");
    const valueElement = select?.querySelector("ui-select-value");
    if (valueElement) {
      valueElement.dispatchEvent(new CustomEvent("value-changed"));
    }
  };

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    const select = this.closest("ui-select");
    if (select && changedProperties.has("value")) {
      const isSelected = this.value === select.value;
      this.setAttribute("aria-selected", String(isSelected));
      if (isSelected) {
        this.setAttribute("data-state", "checked");
      } else {
        this.setAttribute("data-state", "unchecked");
      }
    }
  }

  override render() {
    const select = this.closest("ui-select");
    const isSelected = this.value === select?.value || false;

    return html`
      <div
        role="option"
        aria-selected=${isSelected}
        class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
        ?data-disabled=${this.disabled}
        ?data-highlighted=${this.highlighted}
        @click=${this.handleClick}
      >
        <slot></slot>
        ${
          isSelected
            ? html`
              <span
                class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center"
              >
                ${unsafeSVG(Check)}
              </span>
            `
            : nothing
        }
      </div>
    `;
  }
}

@customElement("ui-select-group")
export class SelectGroup extends TW(LitElement) {
  override render() {
    return html`
      <div role="group" class="py-1">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-select-label")
export class SelectLabel extends TW(LitElement) {
  override render() {
    return html`
      <div class="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-select-separator")
export class SelectSeparator extends TW(LitElement) {
  override render() {
    return html`
      <div
        role="separator"
        class="-mx-1 my-1 h-px bg-border"
        aria-orientation="horizontal"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-select": Select;
    "ui-select-trigger": SelectTrigger;
    "ui-select-value": SelectValue;
    "ui-select-content": SelectContent;
    "ui-select-item": SelectItem;
    "ui-select-group": SelectGroup;
    "ui-select-label": SelectLabel;
    "ui-select-separator": SelectSeparator;
  }

  interface HTMLElementEventMap {
    "select-item-click": CustomEvent<{ value: string }>;
    "trigger-click": CustomEvent;
  }
}
