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
import { ClickAwayController } from "@/controllers/click-away-controller";
import { MenuNavigationController } from "@/controllers/menu-navigation-controller";
import { BaseElement } from "@/registry/lib/base-element";
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

@customElement("ui-dropdown-menu")
export class DropdownMenu
  extends BaseElement
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

  // Click-away controller
  private clickAway = new ClickAwayController(this, {
    onClickAway: () => {
      this.open = false;
    },
    isActive: () => this.open,
    excludeElements: () => {
      const content = this.querySelector("ui-dropdown-menu-content");
      return content ? [content] : [];
    },
  });

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("trigger-click", this.handleTriggerClick);
    this.addEventListener("item-select", this.handleItemSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("trigger-click", this.handleTriggerClick);
    this.removeEventListener("item-select", this.handleItemSelect);
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      this.clickAway.update();

      if (this.open) {
        const content = this.querySelector("ui-dropdown-menu-content");
        if (content) {
          setTimeout(() => {
            const menu =
              content.shadowRoot?.querySelector<HTMLElement>('[role="menu"]');
            menu?.focus();
          }, 0);
        }
      }

      this.emit("open-change", { open: this.open });
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
  extends BaseElement
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
      this.emit("trigger-click");
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
  extends BaseElement
  implements DropdownMenuContentProperties
{
  @property({ type: String }) align: "start" | "center" | "end" = "start";
  @property({ type: String }) side: "top" | "right" | "bottom" | "left" =
    "bottom";
  @property({ type: Number }) sideOffset = 4;
  @property({ type: Number }) alignOffset = 0;
  @property({ type: Boolean }) loop = false;

  @state() protected isOpen = false;
  @state() private highlightedIndex = -1;

  @queryAssignedElements({ flatten: true })
  private items!: HTMLElement[];

  // Menu navigation controller
  private navigation = new MenuNavigationController(this, {
    getItems: () => this.getNavigableItems(),
    getHighlightedIndex: () => this.highlightedIndex,
    setHighlightedIndex: (index) => {
      this.highlightedIndex = index;
    },
    onSelect: (item) => item.click(),
    onEscape: () => {
      const menu = this.closest("ui-dropdown-menu");
      if (menu) menu.open = false;
    },
    loop: () => this.loop, // Reactive getter
  });

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

  override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    // Update highlighted state when index changes
    if (changed.has("highlightedIndex")) {
      const items = this.getNavigableItems();
      items.forEach((item, index) => {
        item.highlighted = index === this.highlightedIndex;
      });
    }
  }

  override updated(changed: PropertyValues) {
    super.updated(changed);

    // Reset navigation state when menu closes
    if (changed.has("isOpen") && !this.isOpen) {
      this.navigation.reset();
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
    this.navigation.handleKeyDown(e);
  };

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
  extends BaseElement
  implements DropdownMenuItemProperties
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

export interface DropdownMenuCheckboxItemProperties {
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-dropdown-menu-checkbox-item")
export class DropdownMenuCheckboxItem
  extends BaseElement
  implements DropdownMenuCheckboxItemProperties
{
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.emit("checked-change", { checked: this.checked });
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
        role="menuitemcheckbox"
        aria-checked=${this.checked}
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
          this.className,
        )}
        data-state=${this.checked ? "checked" : "unchecked"}
        ?data-disabled=${this.disabled}
        ?data-highlighted=${this.highlighted}
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
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
  extends BaseElement
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
      this.emit("value-change", { value: this.value });
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
  extends BaseElement
  implements DropdownMenuRadioItemProperties
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
        role="menuitemradio"
        aria-checked=${this.checked}
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
          this.className,
        )}
        ?data-disabled=${this.disabled}
        ?data-highlighted=${this.highlighted}
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
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
  extends BaseElement
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
  private closeTimeout?: number;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("sub-trigger-click", this.handleTriggerClick);
    this.addEventListener("sub-trigger-mouseenter", this.handleTriggerHover);
    this.addEventListener("sub-trigger-mouseleave", this.handleTriggerLeave);
    this.addEventListener("sub-content-mouseenter", this.handleContentEnter);
    this.addEventListener("sub-content-mouseleave", this.handleContentLeave);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.closeTimeout);
    this.removeEventListener("sub-trigger-click", this.handleTriggerClick);
    this.removeEventListener("sub-trigger-mouseenter", this.handleTriggerHover);
    this.removeEventListener("sub-trigger-mouseleave", this.handleTriggerLeave);
    this.removeEventListener("sub-content-mouseenter", this.handleContentEnter);
    this.removeEventListener("sub-content-mouseleave", this.handleContentLeave);
  }

  private handleTriggerClick = (e: Event) => {
    e.stopPropagation();
    this.open = !this.open;
  };

  private handleTriggerHover = () => {
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.closeTimeout);
    this.hoverTimeout = window.setTimeout(() => {
      this.open = true;
    }, 200);
  };

  private handleTriggerLeave = () => {
    clearTimeout(this.hoverTimeout);
    this.closeTimeout = window.setTimeout(() => {
      this.open = false;
    }, 300);
  };

  private handleContentEnter = () => {
    clearTimeout(this.closeTimeout);
  };

  private handleContentLeave = () => {
    clearTimeout(this.closeTimeout);
    this.closeTimeout = window.setTimeout(() => {
      this.open = false;
    }, 300);
  };

  override render() {
    return html`
      <ui-popover
        .active=${this.open}
        .anchor=${this.triggerElement}
        placement="right-start"
        strategy="fixed"
        .distance=${4}
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
  extends BaseElement
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
    if (!this.disabled) {
      this.emit("sub-trigger-mouseleave");
    }
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
export class DropdownMenuSubContent extends DropdownMenuContent {
  override connectedCallback() {
    super.connectedCallback();
    const sub = this.closest("ui-dropdown-menu-sub");
    if (sub) {
      const observer = new MutationObserver(() => {
        this.isOpen = sub.open;
      });
      observer.observe(sub, { attributes: true, attributeFilter: ["open"] });
      this.isOpen = sub.open;
    }
  }

  private handleMouseEnter = () => {
    this.emit("sub-content-mouseenter");
  };

  private handleMouseLeave = () => {
    this.emit("sub-content-mouseleave");
  };

  override render() {
    const parentRender = super.render();
    if (parentRender === nothing) return nothing;

    return html`
      <div
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        ${parentRender}
      </div>
    `;
  }
}

@customElement("ui-dropdown-menu-separator")
export class DropdownMenuSeparator extends BaseElement {
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
  extends BaseElement
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
export class DropdownMenuGroup extends BaseElement {
  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-dropdown-menu-shortcut")
export class DropdownMenuShortcut extends BaseElement {
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
