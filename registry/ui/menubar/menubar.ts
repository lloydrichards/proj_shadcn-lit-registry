import { ClickAwayController } from "@/controllers/click-away-controller";
import { MenuNavigationController } from "@/controllers/menu-navigation-controller";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";
import "@/registry/ui/popover/popover";
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

export interface MenubarProperties {
  value?: string;
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
    "UI-MENUBAR-ITEM",
    "UI-MENUBAR-CHECKBOX-ITEM",
    "UI-MENUBAR-RADIO-ITEM",
    "UI-MENUBAR-SUB-TRIGGER",
  ];
  return validTags.includes(element.tagName);
}

@customElement("ui-menubar")
export class Menubar extends BaseElement implements MenubarProperties {
  @property({ type: String }) value = "";

  @queryAssignedElements({ selector: "ui-menubar-menu" })
  private menus!: MenubarMenu[];

  // Click-away controller
  private clickAway = new ClickAwayController(this, {
    onClickAway: () => {
      this.value = "";
    },
    isActive: () => this.value !== "",
  });

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      "menubar-trigger-click",
      this.handleTriggerClick as EventListener,
    );
    this.addEventListener("menubar-item-select", this.handleItemSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      "menubar-trigger-click",
      this.handleTriggerClick as EventListener,
    );
    this.removeEventListener("menubar-item-select", this.handleItemSelect);
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.updateMenuStates();
      this.updateRovingTabindex();
      this.clickAway.update();

      this.emit("value-change", { value: this.value });
    }
  }

  private handleTriggerClick = (e: CustomEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    const trigger = e.target;
    const menu = trigger.closest("ui-menubar-menu");
    if (!menu) return;

    if (this.value === menu.value) {
      this.value = "";
    } else {
      this.value = menu.value;
    }
  };

  private handleItemSelect = () => {
    this.value = "";
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const menus = this.menus.filter(
      (m) => !("disabled" in m && (m as { disabled?: boolean }).disabled),
    );
    const currentIndex = menus.findIndex((m) => m.value === this.value);

    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % menus.length;
        this.focusMenu(menus[nextIndex]);
        if (this.value !== "") {
          this.value = menus[nextIndex].value;
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + menus.length) % menus.length;
        this.focusMenu(menus[prevIndex]);
        if (this.value !== "") {
          this.value = menus[prevIndex].value;
        }
        break;
      }
      case "Enter":
        if (this.value === "" && currentIndex >= 0) {
          e.preventDefault();
          this.value = menus[currentIndex].value;
        } else if (this.value !== "") {
          e.preventDefault();
          this.value = "";
          if (currentIndex >= 0) {
            this.focusMenu(menus[currentIndex]);
          }
        }
        break;
      case "Home":
        e.preventDefault();
        this.focusMenu(menus[0]);
        break;
      case "End":
        e.preventDefault();
        this.focusMenu(menus[menus.length - 1]);
        break;
      case "Escape":
        if (this.value !== "") {
          e.preventDefault();
          const currentMenu = menus.find((m) => m.value === this.value);
          this.value = "";
          if (currentMenu) {
            this.focusMenu(currentMenu);
          }
        }
        break;
    }
  };

  private focusMenu(menu: MenubarMenu) {
    const trigger = menu.querySelector("ui-menubar-trigger");
    const button = trigger?.shadowRoot?.querySelector("button");
    button?.focus();
  }

  private updateMenuStates() {
    this.menus.forEach((menu) => {
      menu.open = menu.value === this.value;
    });
  }

  private updateRovingTabindex() {
    const menus = this.menus.filter(
      (m) => !("disabled" in m && (m as { disabled?: boolean }).disabled),
    );
    const openIndex = menus.findIndex((m) => m.open);
    const focusIndex = openIndex >= 0 ? openIndex : 0;

    menus.forEach((menu, index) => {
      const trigger = menu.querySelector("ui-menubar-trigger");
      const button = trigger?.shadowRoot?.querySelector("button");
      if (button) {
        button.tabIndex = index === focusIndex ? 0 : -1;
      }
    });
  }

  override render() {
    return html`
      <div
        role="menubar"
        aria-orientation="horizontal"
        class=${cn(
          "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
          this.className,
        )}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }
}

export interface MenubarMenuProperties {
  value: string;
  open?: boolean;
}

@customElement("ui-menubar-menu")
export class MenubarMenu extends BaseElement implements MenubarMenuProperties {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String }) value = "";
  @property({ type: Boolean, reflect: true }) open = false;

  @query("ui-menubar-trigger") triggerElement?: HTMLElement;

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      const trigger = this.querySelector("ui-menubar-trigger");
      if (trigger) {
        trigger.active = this.open;
      }

      if (this.open) {
        setTimeout(() => {
          const content = this.querySelector("ui-menubar-content");
          const menu =
            content?.shadowRoot?.querySelector<HTMLElement>('[role="menu"]');
          if (menu) {
            menu.focus();
            const contentInstance = content as MenubarContent;
            if (contentInstance) {
              contentInstance.highlightedIndex = 0;
              const items = contentInstance.getNavigableItems();
              contentInstance.updateHighlighted(items);
            }
          }
        }, 0);
      }
    }
  }

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

export interface MenubarTriggerProperties {
  disabled?: boolean;
  active?: boolean;
}

@customElement("ui-menubar-trigger")
export class MenubarTrigger
  extends BaseElement
  implements MenubarTriggerProperties
{
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) active = false;

  private handleClick = (e: Event) => {
    if (!this.disabled) {
      e.stopPropagation();
      this.emit("menubar-trigger-click");
    }
  };

  override render() {
    return html`
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded=${this.active}
        class=${cn(
          "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none",
          "transition-colors hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          this.className,
        )}
        data-state=${this.active ? "open" : "closed"}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

export interface MenubarContentProperties {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  loop?: boolean;
}

@customElement("ui-menubar-content")
export class MenubarContent
  extends BaseElement
  implements MenubarContentProperties
{
  @property({ type: String }) align: "start" | "center" | "end" = "start";
  @property({ type: Number }) sideOffset = 8;
  @property({ type: Number }) alignOffset = 0;
  @property({ type: Boolean }) loop = false;

  @state() protected isOpen = false;
  @state() public highlightedIndex = -1;

  @queryAssignedElements({ flatten: true })
  protected items!: HTMLElement[];

  // Menu navigation controller
  private navigation = new MenuNavigationController(this, {
    getItems: () => this.getNavigableItems(),
    getHighlightedIndex: () => this.highlightedIndex,
    setHighlightedIndex: (index) => {
      this.highlightedIndex = index;
    },
    onSelect: (item, index) => {
      const navItems = this.getNavigableItems();
      const highlightedItem = navItems[index];
      if (
        highlightedItem &&
        highlightedItem.tagName === "UI-MENUBAR-SUB-TRIGGER"
      ) {
        const sub = highlightedItem.closest("ui-menubar-sub");
        if (sub) {
          sub.open = true;
          setTimeout(() => {
            const subContent = sub.querySelector("ui-menubar-sub-content");
            const subMenu =
              subContent?.shadowRoot?.querySelector<HTMLElement>(
                '[role="menu"]',
              );
            if (subMenu) {
              subMenu.focus();
              const subContentInstance = subContent as MenubarSubContent;
              if (subContentInstance) {
                subContentInstance.highlightedIndex = 0;
                const subItems = subContentInstance.getNavigableItems();
                subContentInstance.updateHighlighted(subItems);
              }
            }
          }, 0);
          return;
        }
      }
      item.click();
      const menubar = this.closest("ui-menubar");
      if (menubar) menubar.value = "";
    },
    onEscape: () => {
      const menubar = this.closest("ui-menubar");
      if (menubar) {
        menubar.value = "";
        const menu = this.closest("ui-menubar-menu");
        if (menu) {
          const trigger = menu.querySelector("ui-menubar-trigger");
          const button = trigger?.shadowRoot?.querySelector("button");
          button?.focus();
        }
      }
    },
    loop: () => this.loop,
  });

  override connectedCallback() {
    super.connectedCallback();
    const menu = this.closest("ui-menubar-menu");
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

  public getNavigableItems(): MenuItemWithProperties[] {
    const navigable: MenuItemWithProperties[] = [];
    for (const item of this.items) {
      if (isMenuItemElement(item)) {
        navigable.push(item);
      } else if (item.tagName === "UI-MENUBAR-SUB") {
        const trigger = item.querySelector("ui-menubar-sub-trigger");
        if (trigger && isMenuItemElement(trigger)) {
          navigable.push(trigger);
        }
      }
    }
    return navigable;
  }

  protected handleKeyDown(e: KeyboardEvent) {
    this.navigation.handleKeyDown(e);
  }

  // Keep for backwards compatibility (MenubarMenu calls this)
  public updateHighlighted(items: MenuItemWithProperties[]) {
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
          "animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2",
          this.className,
        )}
        data-side="bottom"
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }
}

export interface MenubarItemProperties {
  disabled?: boolean;
  inset?: boolean;
}

@customElement("ui-menubar-item")
export class MenubarItem extends BaseElement implements MenubarItemProperties {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) inset = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.emit("select", { value: this.textContent });
      this.emit("menubar-item-select");
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

export interface MenubarCheckboxItemProperties {
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-menubar-checkbox-item")
export class MenubarCheckboxItem
  extends BaseElement
  implements MenubarCheckboxItemProperties
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

export interface MenubarRadioGroupProperties {
  value?: string;
}

@customElement("ui-menubar-radio-group")
export class MenubarRadioGroup
  extends BaseElement
  implements MenubarRadioGroupProperties
{
  @property({ type: String }) value = "";

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      "radio-select",
      this.handleRadioSelect as EventListener,
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      "radio-select",
      this.handleRadioSelect as EventListener,
    );
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.updateRadioItems();
    }
  }

  private updateRadioItems() {
    const items = this.querySelectorAll("ui-menubar-radio-item");
    items.forEach((item) => {
      if ("value" in item && typeof item.value === "string") {
        item.checked = item.value === this.value;
      }
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

export interface MenubarRadioItemProperties {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-menubar-radio-item")
export class MenubarRadioItem
  extends BaseElement
  implements MenubarRadioItemProperties
{
  @property({ type: String }) value = "";
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.emit("radio-select", { value: this.value });
      this.emit("menubar-item-select");
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

export interface MenubarSubProperties {
  open?: boolean;
}

@customElement("ui-menubar-sub")
export class MenubarSub extends BaseElement implements MenubarSubProperties {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @query("ui-menubar-sub-trigger") triggerElement?: HTMLElement;

  override connectedCallback() {
    super.connectedCallback();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }

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

export interface MenubarSubTriggerProperties {
  disabled?: boolean;
}

@customElement("ui-menubar-sub-trigger")
export class MenubarSubTrigger
  extends BaseElement
  implements MenubarSubTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private getSubMenuOpen() {
    const sub = this.closest("ui-menubar-sub");
    return sub?.open ? "true" : "false";
  }

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
        aria-haspopup="menu"
        aria-expanded=${this.getSubMenuOpen()}
        tabindex="-1"
        aria-disabled=${this.disabled}
        class=${cn(
          "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent focus:bg-accent data-[state=open]:bg-accent",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
          this.className,
        )}
        ?data-disabled=${this.disabled}
        ?data-highlighted=${this.highlighted}
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

@customElement("ui-menubar-sub-content")
export class MenubarSubContent extends MenubarContent {
  // Override parent's navigation controller with custom ArrowLeft handler
  private subNavigation = new MenuNavigationController(this, {
    getItems: () => this.getNavigableItems(),
    getHighlightedIndex: () => this.highlightedIndex,
    setHighlightedIndex: (index) => {
      this.highlightedIndex = index;
    },
    onSelect: (item) => {
      item.click();
      const menubar = this.closest("ui-menubar");
      if (menubar) menubar.value = "";
    },
    onEscape: () => {
      const menubar = this.closest("ui-menubar");
      if (menubar) {
        menubar.value = "";
        const menu = this.closest("ui-menubar-menu");
        if (menu) {
          const trigger = menu.querySelector("ui-menubar-trigger");
          const button = trigger?.shadowRoot?.querySelector("button");
          button?.focus();
        }
      }
    },
    loop: () => this.loop,
  });

  override connectedCallback() {
    super.connectedCallback();
    const sub = this.closest("ui-menubar-sub");
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

  protected override handleKeyDown(e: KeyboardEvent) {
    // Handle ArrowLeft to go back to parent menu
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      const sub = this.closest("ui-menubar-sub");
      if (sub) {
        sub.open = false;
        setTimeout(() => {
          const trigger = sub.querySelector("ui-menubar-sub-trigger");
          const triggerDiv = trigger?.shadowRoot?.querySelector("div");
          if (triggerDiv instanceof HTMLElement) {
            triggerDiv.focus();
            if (trigger) {
              trigger.highlighted = true;
            }
          }
          const parentContent = sub.closest("ui-menubar-content");
          const parentMenu =
            parentContent?.shadowRoot?.querySelector<HTMLElement>(
              '[role="menu"]',
            );
          parentMenu?.focus();
        }, 0);
      }
      return;
    }

    // Delegate all other keys to controller
    this.subNavigation.handleKeyDown(e);
  }

  override render() {
    if (!this.isOpen) return nothing;

    return html`
      <div
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <div
          role="menu"
          tabindex="0"
          aria-orientation="vertical"
          class=${cn(
            "min-w-[8rem] max-w-[20rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            "animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2",
            this.className,
          )}
          data-side="bottom"
          @keydown=${this.handleKeyDown}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

@customElement("ui-menubar-separator")
export class MenubarSeparator extends BaseElement {
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

export interface MenubarLabelProperties {
  inset?: boolean;
}

@customElement("ui-menubar-label")
export class MenubarLabel
  extends BaseElement
  implements MenubarLabelProperties
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

@customElement("ui-menubar-group")
export class MenubarGroup extends BaseElement {
  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-menubar-shortcut")
export class MenubarShortcut extends BaseElement {
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
    "ui-menubar": Menubar;
    "ui-menubar-menu": MenubarMenu;
    "ui-menubar-trigger": MenubarTrigger;
    "ui-menubar-content": MenubarContent;
    "ui-menubar-item": MenubarItem;
    "ui-menubar-checkbox-item": MenubarCheckboxItem;
    "ui-menubar-radio-group": MenubarRadioGroup;
    "ui-menubar-radio-item": MenubarRadioItem;
    "ui-menubar-sub": MenubarSub;
    "ui-menubar-sub-trigger": MenubarSubTrigger;
    "ui-menubar-sub-content": MenubarSubContent;
    "ui-menubar-separator": MenubarSeparator;
    "ui-menubar-label": MenubarLabel;
    "ui-menubar-group": MenubarGroup;
    "ui-menubar-shortcut": MenubarShortcut;
  }
}
