import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Check, ChevronDown, ChevronRight, Circle } from "lucide-static";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";
import "@/registry/ui/popover/popover";

export interface DropdownMenuProperties {
  open?: boolean;
  modal?: boolean;
}

export type MenuItemWithProperties = HTMLElement & {
  disabled?: boolean;
  highlighted?: boolean;
  value?: string;
  checked?: boolean;
};

export function isMenuItemElement(
  element: HTMLElement,
): element is MenuItemWithProperties {
  const validTags = [
    "UI-DROPDOWN-MENU-ITEM",
    "UI-DROPDOWN-MENU-CHECKBOX-ITEM",
    "UI-DROPDOWN-MENU-RADIO-ITEM",
    "UI-DROPDOWN-MENU-SUB-TRIGGER",
  ];
  return validTags.includes(element.tagName);
}

const isNode = (value: EventTarget | null): value is Node => {
  return value instanceof Node;
};

@customElement("ui-dropdown-menu")
export class DropdownMenu
  extends TW(LitElement)
  implements DropdownMenuProperties
{
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;

  @query("ui-dropdown-menu-trigger") triggerElement?: HTMLElement;
  @query("ui-popover") popoverElement?: HTMLElement;

  private clickAwayHandler = (e: MouseEvent) => {
    if (!this.open) return;
    const content = this.querySelector("ui-dropdown-menu-content");
    if (
      isNode(e.target) &&
      !this.contains(e.target) &&
      (!content || !content.contains(e.target))
    ) {
      this.open = false;
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("trigger-click", this.handleTriggerClick);
    this.addEventListener("item-select", this.handleItemSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("trigger-click", this.handleTriggerClick);
    this.removeEventListener("item-select", this.handleItemSelect);
    document.removeEventListener("click", this.clickAwayHandler);
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      if (this.open) {
        setTimeout(
          () => document.addEventListener("click", this.clickAwayHandler),
          0,
        );
        const content = this.querySelector("ui-dropdown-menu-content");
        if (content) {
          setTimeout(() => {
            const menu =
              content.shadowRoot?.querySelector<HTMLElement>('[role="menu"]');
            menu?.focus();
          }, 0);
        }
      } else {
        document.removeEventListener("click", this.clickAwayHandler);
      }

      this.dispatchEvent(
        new CustomEvent("open-change", {
          detail: { open: this.open },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleTriggerClick = (e: Event) => {
    e.stopPropagation();
    this.open = !this.open;
  };

  private handleItemSelect = () => {
    this.open = false;
  };

  override render() {
    return html`
      <ui-popover
        .active=${this.open}
        .anchor=${this.triggerElement}
        placement="bottom-start"
        .distance=${8}
        .flip=${true}
        .shift=${true}
      >
        <slot name="trigger" slot="anchor"></slot>
        <slot name="content"></slot>
      </ui-popover>
    `;
  }
}

export interface DropdownMenuTriggerProperties {
  disabled?: boolean;
}

@customElement("ui-dropdown-menu-trigger")
export class DropdownMenuTrigger
  extends TW(LitElement)
  implements DropdownMenuTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  private getExpanded() {
    const menu = this.closest("ui-dropdown-menu");
    return menu?.open ? "true" : "false";
  }

  private handleClick = (e: Event) => {
    if (!this.disabled) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("trigger-click", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  override render() {
    return html`
      <button
        type="button"
        role="combobox"
        aria-haspopup="menu"
        aria-expanded=${this.getExpanded()}
        class=${cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          this.className,
        )}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot></slot>
        <span class="ml-2 opacity-50" aria-hidden="true">
          ${unsafeSVG(ChevronDown)}
        </span>
      </button>
    `;
  }
}

export interface DropdownMenuContentProperties {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  loop?: boolean;
}

@customElement("ui-dropdown-menu-content")
export class DropdownMenuContent
  extends TW(LitElement)
  implements DropdownMenuContentProperties
{
  @property({ type: String }) align: "start" | "center" | "end" = "start";
  @property({ type: String }) side: "top" | "right" | "bottom" | "left" =
    "bottom";
  @property({ type: Number }) sideOffset = 4;
  @property({ type: Number }) alignOffset = 0;
  @property({ type: Boolean }) loop = false;

  @state() private isOpen = false;
  @state() private highlightedIndex = -1;
  @state() private typeaheadString = "";
  private typeaheadTimeout?: number;

  @queryAssignedElements({ flatten: true })
  private items!: HTMLElement[];

  override connectedCallback() {
    super.connectedCallback();
    const menu = this.closest("ui-dropdown-menu");
    if (menu) {
      this.isOpen = menu.open;
      const observer = new MutationObserver(() => {
        this.isOpen = menu.open;
      });
      observer.observe(menu, { attributes: true, attributeFilter: ["open"] });
    }
  }

  private getNavigableItems(): MenuItemWithProperties[] {
    return this.items.filter(
      (item): item is MenuItemWithProperties =>
        (item.tagName === "UI-DROPDOWN-MENU-ITEM" ||
          item.tagName === "UI-DROPDOWN-MENU-CHECKBOX-ITEM" ||
          item.tagName === "UI-DROPDOWN-MENU-RADIO-ITEM" ||
          item.tagName === "UI-DROPDOWN-MENU-SUB-TRIGGER") &&
        isMenuItemElement(item) &&
        !item.disabled,
    );
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const navItems = this.getNavigableItems();
    if (navItems.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.highlightedIndex = this.loop
          ? (this.highlightedIndex + 1) % navItems.length
          : Math.min(this.highlightedIndex + 1, navItems.length - 1);
        this.updateHighlighted(navItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.highlightedIndex = this.loop
          ? (this.highlightedIndex - 1 + navItems.length) % navItems.length
          : Math.max(this.highlightedIndex - 1, 0);
        this.updateHighlighted(navItems);
        break;
      case "Home":
        e.preventDefault();
        this.highlightedIndex = 0;
        this.updateHighlighted(navItems);
        break;
      case "End":
        e.preventDefault();
        this.highlightedIndex = navItems.length - 1;
        this.updateHighlighted(navItems);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (this.highlightedIndex >= 0) {
          navItems[this.highlightedIndex]?.click();
        }
        break;
      case "Escape": {
        e.preventDefault();
        const menu = this.closest("ui-dropdown-menu");
        if (menu) menu.open = false;
        break;
      }
      default:
        if (e.key.length === 1) {
          this.handleTypeahead(e.key, navItems);
        }
    }
  };

  private handleTypeahead(char: string, items: HTMLElement[]) {
    clearTimeout(this.typeaheadTimeout);
    this.typeaheadString += char.toLowerCase();

    const matchIndex = items.findIndex((item) =>
      item.textContent?.toLowerCase().startsWith(this.typeaheadString),
    );

    if (matchIndex >= 0) {
      this.highlightedIndex = matchIndex;
      this.updateHighlighted(items);
    }

    this.typeaheadTimeout = window.setTimeout(() => {
      this.typeaheadString = "";
    }, 500);
  }

  private updateHighlighted(items: MenuItemWithProperties[]) {
    items.forEach((item, index) => {
      item.highlighted = index === this.highlightedIndex;
    });
  }

  override render() {
    if (!this.isOpen) return nothing;

    return html`
      <div
        role="menu"
        tabindex="0"
        aria-orientation="vertical"
        class=${cn(
          "min-w-[8rem] max-w-[20rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          this.className,
        )}
        data-side=${this.side}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }
}

export interface DropdownMenuItemProperties {
  disabled?: boolean;
  inset?: boolean;
}

@customElement("ui-dropdown-menu-item")
export class DropdownMenuItem
  extends TW(LitElement)
  implements DropdownMenuItemProperties
{
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) inset = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent("select", {
          detail: { value: this.textContent },
          bubbles: true,
          composed: true,
        }),
      );
      this.dispatchEvent(
        new CustomEvent("item-select", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  private handleMouseEnter = () => {
    if (!this.disabled) {
      this.highlighted = true;
    }
  };

  private handleMouseLeave = () => {
    this.highlighted = false;
  };

  override render() {
    return html`
      <div
        role="menuitem"
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
          this.inset && "pl-8",
          this.className,
        )}
        ?data-disabled=${this.disabled}
        ?data-highlighted=${this.highlighted}
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <slot></slot>
        <span class="ml-auto text-xs">
          <slot name="shortcut"></slot>
        </span>
      </div>
    `;
  }
}

export interface DropdownMenuCheckboxItemProperties {
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-dropdown-menu-checkbox-item")
export class DropdownMenuCheckboxItem
  extends TW(LitElement)
  implements DropdownMenuCheckboxItemProperties
{
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.dispatchEvent(
        new CustomEvent("checked-change", {
          detail: { checked: this.checked },
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  override render() {
    return html`
      <div
        role="menuitemcheckbox"
        aria-checked=${this.checked}
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          this.className,
        )}
        data-state=${this.checked ? "checked" : "unchecked"}
        ?data-disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <span
          class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
        >
          ${this.checked ? unsafeSVG(Check) : nothing}
        </span>
        <slot></slot>
      </div>
    `;
  }
}

export interface DropdownMenuRadioGroupProperties {
  value?: string;
}

@customElement("ui-dropdown-menu-radio-group")
export class DropdownMenuRadioGroup
  extends TW(LitElement)
  implements DropdownMenuRadioGroupProperties
{
  @property({ type: String }) value = "";

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("radio-select", this.handleRadioSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("radio-select", this.handleRadioSelect);
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.updateRadioItems();
    }
  }

  private updateRadioItems() {
    const items = this.querySelectorAll("ui-dropdown-menu-radio-item");
    items.forEach((item) => {
      if (isMenuItemElement(item) && "value" in item) {
        item.checked = item.value === this.value;
      }
    });
  }

  private handleRadioSelect = (e: Event) => {
    if (e instanceof CustomEvent) {
      e.stopPropagation();
      this.value = e.detail.value;
      this.dispatchEvent(
        new CustomEvent("value-change", {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

export interface DropdownMenuRadioItemProperties {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-dropdown-menu-radio-item")
export class DropdownMenuRadioItem
  extends TW(LitElement)
  implements DropdownMenuRadioItemProperties
{
  @property({ type: String }) value = "";
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent("radio-select", {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
      this.dispatchEvent(
        new CustomEvent("item-select", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  override render() {
    return html`
      <div
        role="menuitemradio"
        aria-checked=${this.checked}
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          this.className,
        )}
        ?data-disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <span
          class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
        >
          ${this.checked ? unsafeSVG(Circle) : nothing}
        </span>
        <slot></slot>
      </div>
    `;
  }
}

export interface DropdownMenuSubProperties {
  open?: boolean;
}

@customElement("ui-dropdown-menu-sub")
export class DropdownMenuSub
  extends TW(LitElement)
  implements DropdownMenuSubProperties
{
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @query("ui-dropdown-menu-sub-trigger") triggerElement?: HTMLElement;

  private hoverTimeout?: number;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("sub-trigger-click", this.handleTriggerClick);
    this.addEventListener("sub-trigger-mouseenter", this.handleTriggerHover);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.hoverTimeout);
    this.removeEventListener("sub-trigger-click", this.handleTriggerClick);
    this.removeEventListener("sub-trigger-mouseenter", this.handleTriggerHover);
  }

  private handleTriggerClick = (e: Event) => {
    e.stopPropagation();
    this.open = !this.open;
  };

  private handleTriggerHover = () => {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = window.setTimeout(() => {
      this.open = true;
    }, 200);
  };

  override render() {
    return html`
      <ui-popover
        .active=${this.open}
        .anchor=${this.triggerElement}
        placement="right-start"
        .distance=${0}
        .skidding=${-4}
        .flip=${true}
        .shift=${true}
      >
        <slot name="trigger" slot="anchor"></slot>
        <slot name="content"></slot>
      </ui-popover>
    `;
  }
}

export interface DropdownMenuSubTriggerProperties {
  disabled?: boolean;
}

@customElement("ui-dropdown-menu-sub-trigger")
export class DropdownMenuSubTrigger
  extends TW(LitElement)
  implements DropdownMenuSubTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private getSubMenuOpen() {
    const sub = this.closest("ui-dropdown-menu-sub");
    return sub?.open ? "true" : "false";
  }

  private handleClick = (e: Event) => {
    if (!this.disabled) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("sub-trigger-click", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  private handleMouseEnter = () => {
    if (!this.disabled) {
      this.highlighted = true;
      this.dispatchEvent(
        new CustomEvent("sub-trigger-mouseenter", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  private handleMouseLeave = () => {
    this.highlighted = false;
  };

  override render() {
    return html`
      <div
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded=${this.getSubMenuOpen()}
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent focus:bg-accent data-[state=open]:bg-accent",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          this.className,
        )}
        ?data-disabled=${this.disabled}
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <slot></slot>
        <span class="ml-auto" aria-hidden="true">
          ${unsafeSVG(ChevronRight)}
        </span>
      </div>
    `;
  }
}

@customElement("ui-dropdown-menu-sub-content")
export class DropdownMenuSubContent extends DropdownMenuContent {}

@customElement("ui-dropdown-menu-separator")
export class DropdownMenuSeparator extends TW(LitElement) {
  override render() {
    return html`
      <div
        role="separator"
        aria-orientation="horizontal"
        class="-mx-1 my-1 h-px bg-muted"
      ></div>
    `;
  }
}

export interface DropdownMenuLabelProperties {
  inset?: boolean;
}

@customElement("ui-dropdown-menu-label")
export class DropdownMenuLabel
  extends TW(LitElement)
  implements DropdownMenuLabelProperties
{
  @property({ type: Boolean }) inset = false;

  override render() {
    return html`
      <div
        class=${cn(
          "px-2 py-1.5 text-sm font-semibold",
          this.inset && "pl-8",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-dropdown-menu-group")
export class DropdownMenuGroup extends TW(LitElement) {
  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-dropdown-menu-shortcut")
export class DropdownMenuShortcut extends TW(LitElement) {
  override render() {
    return html`
      <span class="ml-auto text-xs tracking-widest text-muted-foreground">
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-dropdown-menu": DropdownMenu;
    "ui-dropdown-menu-trigger": DropdownMenuTrigger;
    "ui-dropdown-menu-content": DropdownMenuContent;
    "ui-dropdown-menu-item": DropdownMenuItem;
    "ui-dropdown-menu-checkbox-item": DropdownMenuCheckboxItem;
    "ui-dropdown-menu-radio-group": DropdownMenuRadioGroup;
    "ui-dropdown-menu-radio-item": DropdownMenuRadioItem;
    "ui-dropdown-menu-sub": DropdownMenuSub;
    "ui-dropdown-menu-sub-trigger": DropdownMenuSubTrigger;
    "ui-dropdown-menu-sub-content": DropdownMenuSubContent;
    "ui-dropdown-menu-separator": DropdownMenuSeparator;
    "ui-dropdown-menu-label": DropdownMenuLabel;
    "ui-dropdown-menu-group": DropdownMenuGroup;
    "ui-dropdown-menu-shortcut": DropdownMenuShortcut;
  }
}
