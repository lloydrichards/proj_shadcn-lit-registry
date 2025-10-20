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

export interface ContextMenuProperties {
  open?: boolean;
  modal?: boolean;
  disabled?: boolean;
}

@customElement("ui-context-menu")
export class ContextMenu
  extends TW(LitElement)
  implements ContextMenuProperties
{
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
  @state() private virtualAnchor?: { getBoundingClientRect: () => DOMRect };

  @query("ui-popover") popoverElement?: HTMLElement;

  private clickAwayHandler = (e: MouseEvent) => {
    if (!this.open) return;

    const target = e.target as Node;

    if (this.querySelector("ui-context-menu-content")?.contains(target)) return;
    if (this.querySelector("ui-popover")?.contains(target)) return;

    const triggerSlot = this.shadowRoot?.querySelector<HTMLSlotElement>(
      'slot[name="trigger"]',
    );
    if (triggerSlot) {
      const assignedElements = triggerSlot.assignedElements({ flatten: true });
      for (const el of assignedElements) {
        if (el.contains(target)) return;
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
        this.dispatchEvent(
          new CustomEvent("context-menu-close", {
            bubbles: true,
            composed: true,
          }),
        );
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

    this.dispatchEvent(
      new CustomEvent("context-menu-open", {
        detail: { x: this.cursorX, y: this.cursorY },
        bubbles: true,
        composed: true,
      }),
    );
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
  extends TW(LitElement)
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

  private getNavigableItems() {
    return this.items.filter(
      (item) =>
        (item.tagName === "UI-CONTEXT-MENU-ITEM" ||
          item.tagName === "UI-CONTEXT-MENU-CHECKBOX-ITEM" ||
          item.tagName === "UI-CONTEXT-MENU-RADIO-ITEM" ||
          item.tagName === "UI-CONTEXT-MENU-SUB-TRIGGER") &&
        !(item as any).disabled,
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
  extends TW(LitElement)
  implements ContextMenuItemProperties
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

export interface ContextMenuCheckboxItemProperties {
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-context-menu-checkbox-item")
export class ContextMenuCheckboxItem
  extends TW(LitElement)
  implements ContextMenuCheckboxItemProperties
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
  extends TW(LitElement)
  implements ContextMenuRadioGroupProperties
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
    const items = this.querySelectorAll("ui-context-menu-radio-item");
    items.forEach((item) => {
      item.checked = item.value === this.value;
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

export interface ContextMenuRadioItemProperties {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

@customElement("ui-context-menu-radio-item")
export class ContextMenuRadioItem
  extends TW(LitElement)
  implements ContextMenuRadioItemProperties
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

export interface ContextMenuSubProperties {
  open?: boolean;
}

@customElement("ui-context-menu-sub")
export class ContextMenuSub
  extends TW(LitElement)
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
  extends TW(LitElement)
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

@customElement("ui-context-menu-sub-content")
export class ContextMenuSubContent extends ContextMenuContent {}

@customElement("ui-context-menu-separator")
export class ContextMenuSeparator extends TW(LitElement) {
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
  extends TW(LitElement)
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
export class ContextMenuGroup extends TW(LitElement) {
  override render() {
    return html`
      <div role="group">
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-context-menu-shortcut")
export class ContextMenuShortcut extends TW(LitElement) {
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
