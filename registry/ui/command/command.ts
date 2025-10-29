import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { Search } from "lucide-static";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

// Type definitions
export type FilterFunction = (
  value: string,
  search: string,
  keywords?: string[],
) => number;

// Default filter function (similar to cmdk)
const defaultFilter: FilterFunction = (value, search, keywords = []) => {
  const searchLower = search.toLowerCase().trim();
  if (!searchLower) return 1;

  const valueLower = value.toLowerCase();
  const keywordsLower = keywords.map((k) => k.toLowerCase());

  // Exact match = highest score
  if (valueLower === searchLower) return 2;

  // Starts with = high score
  if (valueLower.startsWith(searchLower)) return 1.5;

  // Contains = medium score
  if (valueLower.includes(searchLower)) return 1;

  // Check keywords
  for (const keyword of keywordsLower) {
    if (keyword.includes(searchLower)) return 0.8;
  }

  return 0; // No match
};

// Component properties interfaces
export interface CommandProperties {
  value?: string;
  filter?: FilterFunction;
  shouldFilter?: boolean;
  loop?: boolean;
  label?: string;
}

export interface CommandInputProperties {
  value?: string;
  placeholder?: string;
}

export interface CommandItemProperties {
  value?: string;
  keywords?: string[];
  disabled?: boolean;
  forceMount?: boolean;
}

export interface CommandGroupProperties {
  heading?: string;
  forceMount?: boolean;
}

// Helper type for items with internal state
export type CommandItemWithState = CommandItem & {
  _score: number;
  _highlighted: boolean;
};

/**
 * Main Command component - root container
 */
@customElement("ui-command")
export class Command extends TW(LitElement) implements CommandProperties {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String, reflect: true }) value = "";
  @property({ type: Boolean, attribute: "should-filter" }) shouldFilter = true;
  @property({ type: Boolean }) loop = false;
  @property({ type: String }) label = "Command Menu";
  @property({ attribute: false }) filter?: FilterFunction;

  @state() private _search = "";
  @state() private _filteredCount = 0;
  @state() private _statusMessage = "";

  // Store references to all items and groups for filtering
  private _items = new Set<CommandItem>();
  private _groups = new Set<CommandGroup>();
  private _filterDebounceId?: number;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("command-input-change", this._handleInputChange);
    this.addEventListener("command-item-select", this._handleItemSelect);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("command-input-change", this._handleInputChange);
    this.removeEventListener("command-item-select", this._handleItemSelect);
    if (this._filterDebounceId) {
      cancelAnimationFrame(this._filterDebounceId);
    }
  }

  override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    if (
      changedProperties.has("_search") ||
      changedProperties.has("shouldFilter")
    ) {
      this._scheduleFilterUpdate();
    }
  }

  registerItem(item: CommandItem) {
    this._items.add(item);
    this._scheduleFilterUpdate();
  }

  unregisterItem(item: CommandItem) {
    this._items.delete(item);
    this._scheduleFilterUpdate();
  }

  registerGroup(group: CommandGroup) {
    this._groups.add(group);
  }

  unregisterGroup(group: CommandGroup) {
    this._groups.delete(group);
  }

  private _scheduleFilterUpdate() {
    if (this._filterDebounceId) {
      cancelAnimationFrame(this._filterDebounceId);
    }
    this._filterDebounceId = requestAnimationFrame(() => {
      this._updateFilter();
    });
  }

  private _updateFilter() {
    if (!this.shouldFilter) return;

    const filterFn = this.filter || defaultFilter;
    let visibleCount = 0;

    // Filter items using public methods
    for (const item of this._items) {
      const score = filterFn(item.value, this._search, item.keywords);
      item.updateScore(score);
      if (score > 0) visibleCount++;
    }

    // Update groups visibility using public methods
    for (const group of this._groups) {
      const hasVisibleItems = group.hasVisibleItems();
      group.setHidden(!hasVisibleItems && !group.forceMount);
    }

    this._filteredCount = visibleCount;

    // Update status message for screen readers
    if (this._search) {
      if (visibleCount === 0) {
        this._statusMessage = "No results found";
      } else if (visibleCount === 1) {
        this._statusMessage = "1 result available";
      } else {
        this._statusMessage = `${visibleCount} results available`;
      }
    } else {
      this._statusMessage = "";
    }

    // Reset highlighted index in list if needed
    const list = this.querySelector("ui-command-list") as CommandList;
    if (list) {
      list.resetHighlightAfterFilter();
    }

    // Dispatch event for CommandEmpty and other listeners
    this.dispatchEvent(
      new CustomEvent("filter-update", {
        detail: { filteredCount: visibleCount, search: this._search },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleInputChange = (e: Event) => {
    const event = e as CustomEvent;
    this._search = event.detail.search;

    this.dispatchEvent(
      new CustomEvent("search-change", {
        detail: { search: this._search },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleItemSelect = (e: Event) => {
    const event = e as CustomEvent;
    this.value = event.detail.value;

    this.dispatchEvent(
      new CustomEvent("select", {
        detail: { value: event.detail.value, item: event.detail.item },
        bubbles: true,
        composed: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  getSearchValue() {
    return this._search;
  }

  getFilteredCount() {
    return this._filteredCount;
  }

  override render() {
    return html`
      <div
        class=${cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          this.className,
        )}
      >
        <slot></slot>
        <!-- Live region for screen reader announcements -->
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          class="sr-only absolute"
          style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;"
        >
          ${this._statusMessage}
        </div>
      </div>
    `;
  }
}

/**
 * Command Input component
 */
@customElement("ui-command-input")
export class CommandInput
  extends TW(LitElement)
  implements CommandInputProperties
{
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "Type a command or search...";

  @query("input") private _inputElement!: HTMLInputElement;
  @state() private _activeDescendant = "";
  @state() private _isExpanded = false;
  @state() private _listboxId = "";

  override connectedCallback() {
    super.connectedCallback();

    // Setup listbox reference with unique ID
    this._setupListboxReference();

    // Listen to events on the parent command element (events bubble from list)
    const command = this.closest("ui-command");
    if (command) {
      command.addEventListener(
        "highlight-change",
        this._handleHighlightChange as EventListener,
      );
      command.addEventListener(
        "filter-update",
        this._handleFilterUpdate as EventListener,
      );
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Remove listeners from parent command element
    const command = this.closest("ui-command");
    if (command) {
      command.removeEventListener(
        "highlight-change",
        this._handleHighlightChange as EventListener,
      );
      command.removeEventListener(
        "filter-update",
        this._handleFilterUpdate as EventListener,
      );
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has("value") && this._inputElement) {
      this._inputElement.value = this.value;
    }
  }

  private _setupListboxReference() {
    const list = this.closest("ui-command")?.querySelector("ui-command-list");
    if (list) {
      this._listboxId =
        list.id ||
        `command-list-${Math.random().toString(36).substring(2, 11)}`;
      if (!list.id) {
        list.id = this._listboxId;
      }
    }
  }

  private _handleHighlightChange = (e: CustomEvent) => {
    // Only set if we have a valid non-empty ID
    const itemId = e.detail.itemId;
    this._activeDescendant = itemId && typeof itemId === "string" ? itemId : "";
  };

  private _handleFilterUpdate = (e: CustomEvent) => {
    // Update expanded state based on filtered results
    this._isExpanded = e.detail.filteredCount > 0;
  };

  private _handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    this.value = value;

    this.dispatchEvent(
      new CustomEvent("command-input-change", {
        detail: { search: value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleKeyDown = (e: KeyboardEvent) => {
    const list = this.closest("ui-command")?.querySelector(
      "ui-command-list",
    ) as CommandList;
    if (!list) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!this._isExpanded && this.value) {
          this._isExpanded = true;
        }
        list._navigateNext();
        break;

      case "ArrowUp":
        e.preventDefault();
        list._navigatePrevious();
        break;

      case "Enter":
        e.preventDefault();
        list._selectHighlighted();
        break;

      case "Escape":
        e.preventDefault();
        if (this.value) {
          this.value = "";
          this._handleInput(e);
        } else {
          this._isExpanded = false;
        }
        break;

      case "Home":
        if (e.ctrlKey) {
          e.preventDefault();
          list._navigateFirst();
        }
        break;

      case "End":
        if (e.ctrlKey) {
          e.preventDefault();
          list._navigateLast();
        }
        break;
    }
  };

  override render() {
    return html`
      <div
        class="flex h-9 items-center gap-2 border-b px-3"
        cmdk-input-wrapper=""
      >
        <span
          class="mr-2 size-4 shrink-0 opacity-50"
          aria-hidden="true"
          role="presentation"
        >
          ${unsafeSVG(Search)}
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded=${this._isExpanded ? "true" : "false"}
          aria-controls=${this._listboxId || "command-list"}
          aria-autocomplete="list"
          aria-label="Search commands"
          aria-activedescendant=${this._activeDescendant}
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          class=${cn(
            "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          placeholder=${this.placeholder}
          .value=${this.value}
          @input=${this._handleInput}
          @keydown=${this._handleKeyDown}
        />
      </div>
    `;
  }
}

/**
 * Command List component - handles keyboard navigation
 */
@customElement("ui-command-list")
export class CommandList extends TW(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @state() private _highlightedIndex = -1;

  // Public methods for external control
  public resetHighlightAfterFilter(): void {
    this._resetHighlightAfterFilter();
  }

  public setHighlightedIndex(index: number): void {
    const items = this._getNavigableItems();
    this._highlightedIndex = Math.max(0, Math.min(index, items.length - 1));
    this._updateHighlighted(items);
  }

  public getHighlightedIndex(): number {
    return this._highlightedIndex;
  }

  public syncHighlightToItem(item: CommandItem): void {
    const items = this._getNavigableItems();
    const index = items.indexOf(item as CommandItemWithState);
    if (index >= 0) {
      this._highlightedIndex = index;
      this._updateHighlighted(items);
    }
  }

  // Public navigation methods for keyboard control
  public _navigateNext(): void {
    const items = this._getNavigableItems();
    if (items.length === 0) return;

    // Clamp index to valid range before calculation
    this._highlightedIndex = Math.max(
      -1,
      Math.min(this._highlightedIndex, items.length - 1),
    );

    this._highlightedIndex = this._loop
      ? (this._highlightedIndex + 1) % items.length
      : Math.min(this._highlightedIndex + 1, items.length - 1);
    this._updateHighlighted(items);
  }

  public _navigatePrevious(): void {
    const items = this._getNavigableItems();
    if (items.length === 0) return;

    // Clamp index to valid range before calculation
    this._highlightedIndex = Math.max(
      -1,
      Math.min(this._highlightedIndex, items.length - 1),
    );

    this._highlightedIndex = this._loop
      ? (this._highlightedIndex - 1 + items.length) % items.length
      : Math.max(this._highlightedIndex - 1, 0);
    this._updateHighlighted(items);
  }

  public _navigateFirst(): void {
    const items = this._getNavigableItems();
    if (items.length === 0) return;

    this._highlightedIndex = 0;
    this._updateHighlighted(items);
  }

  public _navigateLast(): void {
    const items = this._getNavigableItems();
    if (items.length === 0) return;

    this._highlightedIndex = items.length - 1;
    this._updateHighlighted(items);
  }

  public _selectHighlighted(): void {
    const items = this._getNavigableItems();
    if (this._highlightedIndex >= 0 && items[this._highlightedIndex]) {
      items[this._highlightedIndex].click();
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    // Get loop setting from parent command
    const command = this.closest("ui-command") as Command;
    this._loop = command?.loop || false;
  }

  private _loop = false;

  private _getNavigableItems(): CommandItemWithState[] {
    // Query all items within the list (they're nested in groups)
    const allItems = Array.from(
      this.querySelectorAll("ui-command-item"),
    ) as CommandItem[];

    return allItems.filter((item): item is CommandItemWithState => {
      if (!(item instanceof CommandItem)) return false;
      return !item.disabled && item.getScore() > 0;
    });
  }

  private _updateHighlighted(items: CommandItemWithState[]) {
    let currentItemId = "";
    items.forEach((item, index) => {
      const isHighlighted = index === this._highlightedIndex;
      item.setHighlighted(isHighlighted);
      if (isHighlighted) {
        item.scrollIntoView({ block: "nearest" });
        // Ensure item has valid ID before using it
        const itemElement = item as CommandItem;
        if (!itemElement.id) {
          itemElement.id = `command-item-${Math.random().toString(36).substring(2, 11)}`;
        }
        currentItemId = itemElement.id;
      }
    });

    // Only dispatch event if we have a valid ID
    if (currentItemId) {
      this.dispatchEvent(
        new CustomEvent("highlight-change", {
          detail: { itemId: currentItemId },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  _resetHighlightAfterFilter() {
    const items = this._getNavigableItems();
    if (this._highlightedIndex >= items.length) {
      this._highlightedIndex = Math.max(0, items.length - 1);
    }
    this._updateHighlighted(items);
  }

  override render() {
    const command = this.closest("ui-command") as Command;
    const label = command?.label
      ? `${command.label} options`
      : "Command menu options";

    return html`
      <div
        id="command-list"
        role="listbox"
        aria-label=${label}
        class=${cn(
          "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Command Item component
 */
@customElement("ui-command-item")
export class CommandItem
  extends TW(LitElement)
  implements CommandItemProperties
{
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String }) value = "";
  @property({ type: String }) id = "";
  @property({ attribute: false }) keywords: string[] = [];
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean, attribute: "force-mount" }) forceMount = false;

  @state() _score = 1;
  @state() _highlighted = false;

  // Public methods for external state updates
  public updateScore(score: number): void {
    this._score = score;
  }

  public setHighlighted(highlighted: boolean): void {
    this._highlighted = highlighted;
  }

  public getScore(): number {
    return this._score;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Auto-generate ID if not provided
    if (!this.id) {
      this.id = `command-item-${Math.random().toString(36).substring(2, 11)}`;
    }

    const command = this.closest("ui-command") as Command;
    if (command) {
      command.registerItem(this);
    }

    // Register with parent group if exists
    const group = this.closest("ui-command-group") as CommandGroup;
    if (group) {
      group.registerChildItem(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const command = this.closest("ui-command") as Command;
    if (command) {
      command.unregisterItem(this);
    }

    // Unregister from parent group if exists
    const group = this.closest("ui-command-group") as CommandGroup;
    if (group) {
      group.unregisterChildItem(this);
    }
  }

  override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    // Auto-infer value from textContent if not provided
    if (!this.value && this.textContent) {
      this.value = this.textContent.trim();
    }
  }

  private _handleClick = () => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("command-item-select", {
        detail: { value: this.value, item: this },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleMouseEnter = () => {
    if (!this.disabled && this.getScore() > 0) {
      this.setHighlighted(true);
      // Notify list to sync highlighted index
      const list = this.closest("ui-command-list") as CommandList;
      if (list) {
        list.syncHighlightToItem(this);
      }
    }
  };

  private _handleMouseLeave = () => {
    this.setHighlighted(false);
  };

  override render() {
    // Don't render if filtered out (unless forceMount)
    if (!this.forceMount && this._score === 0) {
      return nothing;
    }

    return html`
      <div
        id=${this.id}
        role="option"
        aria-selected=${this._highlighted}
        aria-disabled=${this.disabled}
        class=${cn(
          "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "transition-colors duration-100",
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
          "aria-[selected=false]:hover:bg-accent/50 aria-[selected=false]:hover:text-accent-foreground",
          "aria-disabled:pointer-events-none aria-disabled:opacity-50",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
          this.className,
        )}
        @click=${this._handleClick}
        @mouseenter=${this._handleMouseEnter}
        @mouseleave=${this._handleMouseLeave}
      >
        <slot></slot>
        <slot name="shortcut"></slot>
      </div>
    `;
  }
}

/**
 * Command Empty component
 */
@customElement("ui-command-empty")
export class CommandEmpty extends TW(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @state() private _shouldShow = false;

  override connectedCallback() {
    super.connectedCallback();
    this._checkVisibility();

    // Listen for filter update events on parent command
    const command = this.closest("ui-command");
    if (command) {
      command.addEventListener("filter-update", this._handleFilterUpdate);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Remove listener from parent command
    const command = this.closest("ui-command");
    if (command) {
      command.removeEventListener("filter-update", this._handleFilterUpdate);
    }
  }

  private _handleFilterUpdate = () => {
    this._checkVisibility();
  };

  private _checkVisibility() {
    const command = this.closest("ui-command") as Command;
    if (command) {
      // Show empty state if there's a search query but no results
      const searchValue = command.getSearchValue();
      const filteredCount = command.getFilteredCount();
      this._shouldShow = searchValue.length > 0 && filteredCount === 0;
    }
  }

  override render() {
    if (!this._shouldShow) {
      return nothing;
    }

    return html`
      <div
        role="status"
        aria-live="polite"
        class=${cn("py-6 text-center text-sm", this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Command Group component
 */
@customElement("ui-command-group")
export class CommandGroup
  extends TW(LitElement)
  implements CommandGroupProperties
{
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String }) heading = "";
  @property({ type: Boolean, attribute: "force-mount" }) forceMount = false;

  @state() _hidden = false;
  private _childItems = new Set<CommandItem>();

  // Public methods for managing child items
  public registerChildItem(item: CommandItem): void {
    this._childItems.add(item);
  }

  public unregisterChildItem(item: CommandItem): void {
    this._childItems.delete(item);
  }

  public hasVisibleItems(): boolean {
    return Array.from(this._childItems).some((item) => item.getScore() > 0);
  }

  public setHidden(hidden: boolean): void {
    this._hidden = hidden;
  }

  override connectedCallback() {
    super.connectedCallback();
    const command = this.closest("ui-command") as Command;
    if (command) {
      command.registerGroup(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    const command = this.closest("ui-command") as Command;
    if (command) {
      command.unregisterGroup(this);
    }
  }

  override render() {
    if (this._hidden && !this.forceMount) {
      return nothing;
    }

    const headingId = this.heading
      ? `group-heading-${this.id || Math.random().toString(36).substring(2, 11)}`
      : "";

    return html`
      <div
        role="group"
        aria-labelledby=${headingId || nothing}
        class=${cn("overflow-hidden p-1 text-foreground", this.className)}
      >
        ${
          this.heading
            ? html`
              <div
                id=${headingId}
                role="presentation"
                class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
              >
                ${this.heading}
              </div>
            `
            : nothing
        }
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Command Separator component
 */
@customElement("ui-command-separator")
export class CommandSeparator extends TW(LitElement) {
  override render() {
    return html`
      <div
        role="separator"
        aria-orientation="horizontal"
        class=${cn("-mx-1 h-px bg-border", this.className)}
      ></div>
    `;
  }
}

/**
 * Command Shortcut component
 */
@customElement("ui-command-shortcut")
export class CommandShortcut extends TW(LitElement) {
  static styles = css`
    :host {
      display: inline;
    }
  `;

  override render() {
    return html`
      <span
        class=${cn(
          "ml-auto text-xs tracking-widest text-muted-foreground",
          this.className,
        )}
      >
        <slot></slot>
      </span>
    `;
  }
}

/**
 * Command Loading component
 */
@customElement("ui-command-loading")
export class CommandLoading extends TW(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`
      <div class=${cn("py-6 text-center text-sm", this.className)}>
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Command Dialog component properties
 */
export interface CommandDialogProperties {
  open?: boolean;
  modal?: boolean;
  shortcut?: string;
  enableShortcut?: boolean;
  closeOnSelect?: boolean;
  shouldFilter?: boolean;
  loop?: boolean;
  placeholder?: string;
}

/**
 * Command Dialog - A command menu displayed in a dialog modal.
 * Commonly used for application-wide command palettes (like VS Code's Command Palette).
 * Keyboard shortcut defaults to Cmd/Ctrl+K.
 */
@customElement("ui-command-dialog")
export class CommandDialog
  extends TW(LitElement)
  implements CommandDialogProperties
{
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;
  /**
   * Keyboard shortcut key (default: "k" with Cmd/Ctrl).
   * Note: Cmd/Ctrl+K may conflict with browser shortcuts in some browsers.
   * Consider using a different key or requiring additional modifiers.
   */
  @property({ type: String }) shortcut = "k";
  @property({ type: Boolean, attribute: "enable-shortcut" })
  enableShortcut = true;
  @property({ type: Boolean, attribute: "close-on-select" })
  closeOnSelect = true;
  @property({ type: Boolean, attribute: "should-filter" }) shouldFilter = true;
  @property({ type: Boolean }) loop = false;
  @property({ type: String }) placeholder = "Type a command or search...";

  private _keydownHandler?: (e: KeyboardEvent) => void;
  private _isHandlerRegistered = false;

  render() {
    return html`
      <ui-dialog
        .open=${this.open}
        .modal=${this.modal}
        @open-change=${this._handleOpenChange}
      >
        <ui-dialog-content slot="content" class="p-0 gap-0 max-w-[640px]">
          <ui-command
            class="[&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-b-border"
            .shouldFilter=${this.shouldFilter}
            .loop=${this.loop}
          >
            <slot name="input">
              <ui-command-input
                .placeholder=${this.placeholder}
              ></ui-command-input>
            </slot>

            <ui-command-list>
              <slot name="empty">
                <ui-command-empty>No results found.</ui-command-empty>
              </slot>
              <slot></slot>
            </ui-command-list>
          </ui-command>
        </ui-dialog-content>
      </ui-dialog>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();

    if (this.enableShortcut) {
      this._registerKeyboardShortcut();
    }

    // Listen for select events from command (bubbles through slotted content)
    this.addEventListener("select", this._handleCommandSelect as EventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unregisterKeyboardShortcut();
    this.removeEventListener(
      "select",
      this._handleCommandSelect as EventListener,
    );
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("enableShortcut")) {
      if (this.enableShortcut) {
        this._registerKeyboardShortcut();
      } else {
        this._unregisterKeyboardShortcut();
      }
    }

    if (changedProperties.has("shortcut")) {
      // Re-register with new shortcut key
      this._unregisterKeyboardShortcut();
      if (this.enableShortcut) {
        this._registerKeyboardShortcut();
      }
    }
  }

  private _registerKeyboardShortcut() {
    // Prevent double registration
    if (this._isHandlerRegistered) {
      this._unregisterKeyboardShortcut();
    }

    this._keydownHandler = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + configured key
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === this.shortcut.toLowerCase()
      ) {
        e.preventDefault();
        this.open = !this.open;

        this.dispatchEvent(
          new CustomEvent("shortcut-triggered", {
            detail: {
              key: this.shortcut,
              modifiers: [e.metaKey ? "meta" : "ctrl"],
            },
            bubbles: true,
            composed: true,
          }),
        );
      }
    };

    document.addEventListener("keydown", this._keydownHandler);
    this._isHandlerRegistered = true;
  }

  private _unregisterKeyboardShortcut() {
    if (this._keydownHandler && this._isHandlerRegistered) {
      document.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = undefined;
      this._isHandlerRegistered = false;
    }
  }

  private _handleOpenChange = (e: CustomEvent<{ open: boolean }>) => {
    this.open = e.detail.open;

    // Re-emit for external listeners
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleCommandSelect = (e: CustomEvent) => {
    // Re-emit command-select event
    this.dispatchEvent(
      new CustomEvent("command-select", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );

    // Auto-close if enabled
    if (this.closeOnSelect) {
      this.open = false;
    }
  };
}

// Event detail types
export interface CommandDialogOpenChangeEvent {
  open: boolean;
}

export interface CommandDialogShortcutEvent {
  key: string;
  modifiers: string[];
}

// Type declarations for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    "ui-command": Command;
    "ui-command-input": CommandInput;
    "ui-command-list": CommandList;
    "ui-command-item": CommandItem;
    "ui-command-empty": CommandEmpty;
    "ui-command-group": CommandGroup;
    "ui-command-separator": CommandSeparator;
    "ui-command-shortcut": CommandShortcut;
    "ui-command-loading": CommandLoading;
    "ui-command-dialog": CommandDialog;
  }

  interface HTMLElementEventMap {
    "shortcut-triggered": CustomEvent<CommandDialogShortcutEvent>;
  }
}
