import { css, html, nothing, type PropertyValues } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Check, ChevronRight, Circle } from "lucide-static";

import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";
import "@/registry/ui/popover/popover";

export type ContextMenuProperties = {
  open?: boolean;
  modal?: boolean;
  disabled?: boolean;
};

type VirtualAnchor = {
  getBoundingClientRect(): DOMRect;
};

type AnchorElement = Element | VirtualAnchor;

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
    "UI-CONTEXT-MENU-ITEM",
    "UI-CONTEXT-MENU-CHECKBOX-ITEM",
    "UI-CONTEXT-MENU-RADIO-ITEM",
    "UI-CONTEXT-MENU-SUB-TRIGGER",
  ];
  return validTags.includes(element.tagName);
}

const isNode = (value: EventTarget | null): value is Node => {
  return value instanceof Node;
};

@customElement("ui-context-menu")
export class ContextMenu extends BaseElement implements ContextMenuProperties {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;
  @property({ type: Boolean }) disabled = false;

  @state() private cursorX = 0;
  @state() private cursorY = 0;
  @state() private virtualAnchor?: AnchorElement;

  @query("ui-popover") popoverElement?: HTMLElement;

  private clickAwayHandler = (e: MouseEvent) => {
    if (!this.open) return;

    if (!isNode(e.target)) return;

    if (this.querySelector("ui-context-menu-content")?.contains(e.target))
      return;
    if (this.querySelector("ui-popover")?.contains(e.target)) return;

    const triggerSlot = this.shadowRoot?.querySelector<HTMLSlotElement>(
      'slot[name="trigger"]',
    );
    if (triggerSlot) {
      const assignedElements = triggerSlot.assignedElements({ flatten: true });
      for (const el of assignedElements) {
        if (el.contains(e.target)) return;
      }
    }

    this.open = false;
  };

  private escapeHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.open) {
      e.preventDefault();
      this.open = false;
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("item-select", this.handleItemSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("item-select", this.handleItemSelect);
    document.removeEventListener("click", this.clickAwayHandler, true);
    document.removeEventListener("keydown", this.escapeHandler);
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      if (this.open) {
        setTimeout(() => {
          document.addEventListener("click", this.clickAwayHandler, true);
          document.addEventListener("keydown", this.escapeHandler);
        }, 100);
        const content = this.querySelector("ui-context-menu-content");
        if (content) {
          setTimeout(() => {
            const menu =
              content.shadowRoot?.querySelector<HTMLElement>('[role="menu"]');
            menu?.focus();
          }, 0);
        }
      } else {
        document.removeEventListener("click", this.clickAwayHandler, true);
        document.removeEventListener("keydown", this.escapeHandler);
        this.emit("context-menu-close");
      }
    }
  }

  private handleContextMenu = (e: MouseEvent) => {
    if (this.disabled) return;

    e.preventDefault();
    e.stopPropagation();

    this.cursorX = e.clientX;
    this.cursorY = e.clientY;

    this.virtualAnchor = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: this.cursorX,
        y: this.cursorY,
        top: this.cursorY,
        left: this.cursorX,
        right: this.cursorX,
        bottom: this.cursorY,
        toJSON: () => this,
      }),
    };

    this.open = true;

    this.emit("context-menu-open", { x: this.cursorX, y: this.cursorY });
  };

  private handleItemSelect = () => {
    this.open = false;
  };

  override render() {
    return html`
      <slot name="trigger" @contextmenu=${this.handleContextMenu}></slot>

      <ui-popover
        .active=${this.open}
        .anchor=${this.virtualAnchor as Element}
        placement="bottom-start"
        strategy="fixed"
        .distance=${0}
        .flip=${true}
        .shift=${true}
      >
        <slot name="content"></slot>
      </ui-popover>
    `;
  }
}

export interface ContextMenuContentProperties {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
}

@customElement("ui-context-menu-content")
export class ContextMenuContent
  extends BaseElement
  implements ContextMenuContentProperties
{
  @property({ type: String }) align: "start" | "center" | "end" = "start";
  @property({ type: Number }) sideOffset = 5;
  @property({ type: Number }) alignOffset = 0;
  @property({ type: Boolean }) avoidCollisions = true;
  @property({ type: Number }) collisionPadding = 8;

  @state() private isOpen = false;
  @state() private highlightedIndex = -1;
  @state() private typeaheadString = "";
  private typeaheadTimeout?: number;

  @queryAssignedElements({ flatten: true })
  private items!: HTMLElement[];

  override connectedCallback() {
    super.connectedCallback();
    const menu = this.closest("ui-context-menu");
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
        isMenuItemElement(item) && !item.disabled,
    );
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const navItems = this.getNavigableItems();
    if (navItems.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          navItems.length - 1,
        );
        this.updateHighlighted(navItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
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
        const menu = this.closest("ui-context-menu");
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
          "animate-in fade-in-80 zoom-in-95",
          this.className,
        )}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }
}

export interface ContextMenuItemProperties {
  disabled?: boolean;
  inset?: boolean;
}

@customElement("ui-context-menu-item")
export class ContextMenuItem
  extends BaseElement
  implements ContextMenuItemProperties
{
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) inset = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.emit("select", { value: this.textContent });
      this.emit("item-select");
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

export interface ContextMenuCheckboxItemProperties {
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-context-menu-checkbox-item")
export class ContextMenuCheckboxItem
  extends BaseElement
  implements ContextMenuCheckboxItemProperties
{
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.emit("checked-change", { checked: this.checked });
      this.emit("item-select");
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

export interface ContextMenuRadioGroupProperties {
  value?: string;
}

@customElement("ui-context-menu-radio-group")
export class ContextMenuRadioGroup
  extends BaseElement
  implements ContextMenuRadioGroupProperties
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
    const items = this.querySelectorAll("ui-context-menu-radio-item");
    items.forEach((item) => {
      item.checked = item.value === this.value;
    });
  }

  private handleRadioSelect = (e: Event) => {
    if (!(e instanceof CustomEvent)) return;
    e.stopPropagation();
    this.value = e.detail.value;
    this.emit("value-change", { value: this.value });
  };

  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

export interface ContextMenuRadioItemProperties {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-context-menu-radio-item")
export class ContextMenuRadioItem
  extends BaseElement
  implements ContextMenuRadioItemProperties
{
  @property({ type: String }) value = "";
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.emit("radio-select", { value: this.value });
      this.emit("item-select");
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

export interface ContextMenuSubProperties {
  open?: boolean;
}

@customElement("ui-context-menu-sub")
export class ContextMenuSub
  extends BaseElement
  implements ContextMenuSubProperties
{
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @query("ui-context-menu-sub-trigger") triggerElement?: HTMLElement;

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

export interface ContextMenuSubTriggerProperties {
  disabled?: boolean;
}

@customElement("ui-context-menu-sub-trigger")
export class ContextMenuSubTrigger
  extends BaseElement
  implements ContextMenuSubTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private getSubMenuOpen() {
    const sub = this.closest("ui-context-menu-sub");
    return sub?.open ? "true" : "false";
  }

  private handleClick = (e: Event) => {
    if (!this.disabled) {
      e.stopPropagation();
      this.emit("sub-trigger-click");
    }
  };

  private handleMouseEnter = () => {
    if (!this.disabled) {
      this.highlighted = true;
      this.emit("sub-trigger-mouseenter");
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

@customElement("ui-context-menu-sub-content")
export class ContextMenuSubContent extends ContextMenuContent {}

@customElement("ui-context-menu-separator")
export class ContextMenuSeparator extends BaseElement {
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

export interface ContextMenuLabelProperties {
  inset?: boolean;
}

@customElement("ui-context-menu-label")
export class ContextMenuLabel
  extends BaseElement
  implements ContextMenuLabelProperties
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

@customElement("ui-context-menu-group")
export class ContextMenuGroup extends BaseElement {
  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-context-menu-shortcut")
export class ContextMenuShortcut extends BaseElement {
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
    "ui-context-menu": ContextMenu;
    "ui-context-menu-content": ContextMenuContent;
    "ui-context-menu-item": ContextMenuItem;
    "ui-context-menu-checkbox-item": ContextMenuCheckboxItem;
    "ui-context-menu-radio-group": ContextMenuRadioGroup;
    "ui-context-menu-radio-item": ContextMenuRadioItem;
    "ui-context-menu-sub": ContextMenuSub;
    "ui-context-menu-sub-trigger": ContextMenuSubTrigger;
    "ui-context-menu-sub-content": ContextMenuSubContent;
    "ui-context-menu-separator": ContextMenuSeparator;
    "ui-context-menu-label": ContextMenuLabel;
    "ui-context-menu-group": ContextMenuGroup;
    "ui-context-menu-shortcut": ContextMenuShortcut;
  }
}
