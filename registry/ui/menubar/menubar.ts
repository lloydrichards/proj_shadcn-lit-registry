import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Check, ChevronRight, Circle } from "lucide-static";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";
import "@/registry/ui/popover/popover";

export interface MenubarProperties {
  value?: string;
}

@customElement("ui-menubar")
export class Menubar extends TW(LitElement) implements MenubarProperties {
  @property({ type: String }) value = "";
  @state() private hovering = false;

  @queryAssignedElements({ selector: "ui-menubar-menu" })
  private menus!: MenubarMenu[];

  private clickAwayHandler = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.value = "";
      this.hovering = false;
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      "menubar-trigger-click",
      this.handleTriggerClick as EventListener,
    );
    this.addEventListener(
      "menubar-trigger-hover",
      this.handleTriggerHover as EventListener,
    );
    this.addEventListener("menubar-item-select", this.handleItemSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      "menubar-trigger-click",
      this.handleTriggerClick as EventListener,
    );
    this.removeEventListener(
      "menubar-trigger-hover",
      this.handleTriggerHover as EventListener,
    );
    this.removeEventListener("menubar-item-select", this.handleItemSelect);
    document.removeEventListener("click", this.clickAwayHandler);
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.updateMenuStates();
      this.updateRovingTabindex();

      if (this.value !== "") {
        setTimeout(
          () => document.addEventListener("click", this.clickAwayHandler),
          0,
        );
      } else {
        document.removeEventListener("click", this.clickAwayHandler);
      }

      this.dispatchEvent(
        new CustomEvent("value-change", {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleTriggerClick = (e: CustomEvent) => {
    const trigger = e.target as HTMLElement;
    const menu = trigger.closest("ui-menubar-menu");
    if (!menu) return;

    if (this.value === menu.value) {
      this.value = "";
      this.hovering = false;
    } else {
      this.value = menu.value;
      this.hovering = true;
    }
  };

  private handleTriggerHover = (e: CustomEvent) => {
    if (this.hovering && this.value !== "") {
      const trigger = e.target as HTMLElement;
      const menu = trigger.closest("ui-menubar-menu");
      if (menu) {
        this.value = menu.value;
      }
    }
  };

  private handleItemSelect = () => {
    this.value = "";
    this.hovering = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const menus = this.menus.filter((m) => !(m as any).disabled);
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
      case "ArrowDown":
        if (this.value === "" && currentIndex >= 0) {
          e.preventDefault();
          this.value = menus[currentIndex].value;
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
          this.hovering = false;
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
    const menus = this.menus.filter((m) => !(m as any).disabled);
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
export class MenubarMenu
  extends TW(LitElement)
  implements MenubarMenuProperties
{
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
          menu?.focus();
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
  extends TW(LitElement)
  implements MenubarTriggerProperties
{
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) active = false;

  private handleClick = (e: Event) => {
    if (!this.disabled) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("menubar-trigger-click", {
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  private handleMouseEnter = () => {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent("menubar-trigger-hover", {
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
        @mouseenter=${this.handleMouseEnter}
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
  extends TW(LitElement)
  implements MenubarContentProperties
{
  @property({ type: String }) align: "start" | "center" | "end" = "start";
  @property({ type: Number }) sideOffset = 8;
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
    const menu = this.closest("ui-menubar-menu");
    if (menu) {
      this.isOpen = menu.open;
      const observer = new MutationObserver(() => {
        this.isOpen = menu.open;
      });
      observer.observe(menu, { attributes: true, attributeFilter: ["open"] });
    }
  }

  private getNavigableItems() {
    return this.items.filter(
      (item) =>
        (item.tagName === "UI-MENUBAR-ITEM" ||
          item.tagName === "UI-MENUBAR-CHECKBOX-ITEM" ||
          item.tagName === "UI-MENUBAR-RADIO-ITEM" ||
          item.tagName === "UI-MENUBAR-SUB-TRIGGER") &&
        !(item as any).disabled,
    );
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const menu = this.closest("ui-menubar-menu");
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
        if (menu) menu.open = false;
        break;
      case "ArrowLeft": {
        e.preventDefault();
        const menubar = this.closest("ui-menubar");
        const menu = this.closest("ui-menubar-menu");
        if (menubar && menu) {
          const menus = Array.from(menubar.querySelectorAll("ui-menubar-menu"));
          const prevIndex =
            (menus.indexOf(menu) + 1 + menus.length) % menus.length;
          menubar.value = menus[prevIndex].value;
        }
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        const menubar2 = this.closest("ui-menubar");
        const menu2 = this.closest("ui-menubar-menu");
        if (menubar2 && menu2) {
          const menus = Array.from(
            menubar2.querySelectorAll("ui-menubar-menu"),
          );
          const nextIndex = menus.indexOf(menu2) - (1 % menus.length);
          menubar2.value = menus[nextIndex].value;
        }
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

  private updateHighlighted(items: HTMLElement[]) {
    items.forEach((item, index) => {
      (item as any).highlighted = index === this.highlightedIndex;
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
export class MenubarItem
  extends TW(LitElement)
  implements MenubarItemProperties
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
        new CustomEvent("menubar-item-select", {
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

export interface MenubarCheckboxItemProperties {
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-menubar-checkbox-item")
export class MenubarCheckboxItem
  extends TW(LitElement)
  implements MenubarCheckboxItemProperties
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

export interface MenubarRadioGroupProperties {
  value?: string;
}

@customElement("ui-menubar-radio-group")
export class MenubarRadioGroup
  extends TW(LitElement)
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
      item.checked = (item as any).value === this.value;
    });
  }

  private handleRadioSelect = (e: CustomEvent) => {
    e.stopPropagation();
    this.value = e.detail.value;
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
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
  extends TW(LitElement)
  implements MenubarRadioItemProperties
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
        new CustomEvent("menubar-item-select", {
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

export interface MenubarSubProperties {
  open?: boolean;
}

@customElement("ui-menubar-sub")
export class MenubarSub extends TW(LitElement) implements MenubarSubProperties {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @query("ui-menubar-sub-trigger") triggerElement?: HTMLElement;

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

export interface MenubarSubTriggerProperties {
  disabled?: boolean;
}

@customElement("ui-menubar-sub-trigger")
export class MenubarSubTrigger
  extends TW(LitElement)
  implements MenubarSubTriggerProperties
{
  @property({ type: Boolean }) disabled = false;

  @state() highlighted = false;

  private getSubMenuOpen() {
    const sub = this.closest("ui-menubar-sub");
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

@customElement("ui-menubar-sub-content")
export class MenubarSubContent extends MenubarContent {}

@customElement("ui-menubar-separator")
export class MenubarSeparator extends TW(LitElement) {
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
  extends TW(LitElement)
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
export class MenubarGroup extends TW(LitElement) {
  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-menubar-shortcut")
export class MenubarShortcut extends TW(LitElement) {
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
