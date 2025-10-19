import { cva, type VariantProps } from "class-variance-authority";
import { adoptStyles, html, LitElement, nothing, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW, tailwind } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";
import itemSlottedCss from "./item.slotted.css?inline";

/**
 * Item component variants for styling the main container.
 */
export const itemVariants = cva(
  "flex flex-col gap-4 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-background hover:bg-accent/50",
        outline: "border bg-card hover:bg-accent/50",
        muted: "bg-muted/50 hover:bg-muted text-muted-foreground",
      },
      size: {
        default: "p-4 rounded-lg",
        sm: "p-3 rounded-md text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ItemVariants = VariantProps<typeof itemVariants>;

export interface ItemProperties {
  variant?: ItemVariants["variant"];
  size?: ItemVariants["size"];
  ariaLabel?: string | null;
  ariaDescribedby?: string | null;
  role?: string | null;
}

/**
 * A versatile item component using named slots for flexible content composition.
 *
 * @slot header - Optional header content above the main content area
 * @slot title - Title content (automatically styled via slotted CSS)
 * @slot description - Description content (automatically styled via slotted CSS)
 * @slot media - Optional icon/avatar/image area (positioned at the start)
 * @slot - Default slot for additional content
 * @slot actions - Optional action buttons/controls (positioned at the end)
 * @slot footer - Optional footer content below the main content area
 *
 * @example Basic usage with named slots
 * ```html
 * <ui-item variant="outline">
 *   <div slot="media" class="size-10 rounded-full bg-muted">CN</div>
 *   <h3 slot="title">Title</h3>
 *   <p slot="description">Description text</p>
 *   <ui-button slot="actions" size="sm">Action</ui-button>
 * </ui-item>
 * ```
 *
 * @example With header and footer
 * ```html
 * <ui-item variant="outline">
 *   <div slot="header" class="aspect-square w-full rounded-sm bg-muted"></div>
 *   <h3 slot="title">Title</h3>
 *   <p slot="description">Description text</p>
 *   <div slot="footer" class="text-xs text-muted-foreground">Footer text</div>
 * </ui-item>
 * ```
 */
const TwLitElement = TW(LitElement);

const itemSlottedStyles = unsafeCSS(itemSlottedCss);

@customElement("ui-item")
export class Item extends TwLitElement implements ItemProperties {
  static styles = itemSlottedStyles;

  @property({ type: String }) variant: ItemVariants["variant"] = "default";
  @property({ type: String }) size: ItemVariants["size"] = "default";

  @property({ type: String, attribute: "aria-label" }) accessor ariaLabel:
    | string
    | null = null;
  @property({ type: String, attribute: "aria-describedby" })
  accessor ariaDescribedby: string | null = null;
  @property({ type: String, attribute: "role" }) accessor role: string | null =
    null;

  override connectedCallback() {
    super.connectedCallback();
    if (this.shadowRoot) {
      adoptStyles(this.shadowRoot, [tailwind, itemSlottedStyles]);
    }
  }

  override render() {
    return html`
      <div
        data-slot="item"
        class=${itemVariants({
          variant: this.variant,
          size: this.size,
          class: this.className,
        })}
        aria-label=${this.ariaLabel || nothing}
        aria-describedby=${this.ariaDescribedby || nothing}
        role=${this.role as ""}
      >
        <slot name="header"></slot>
        <div class="flex items-center gap-4 w-full min-w-0">
          <slot name="media"></slot>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <slot data-slot="item-title" name="title"> </slot>
            <slot data-slot="item-description" name="description"></slot>
            <slot></slot>
          </div>
          <slot name="actions"></slot>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }
}

/**
 * Group container for organizing multiple items with consistent spacing.
 *
 * @example
 * ```html
 * <ui-item-group>
 *   <ui-item>Item 1</ui-item>
 *   <ui-item-separator></ui-item-separator>
 *   <ui-item>Item 2</ui-item>
 * </ui-item-group>
 * ```
 */
@customElement("ui-item-group")
export class ItemGroup extends TW(LitElement) {
  override render() {
    return html`
      <div
        data-slot="item-group"
        class=${cn("flex flex-col gap-2", this.className)}
        role="list"
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Visual separator for dividing items within a group.
 *
 * @example
 * ```html
 * <ui-item-group>
 *   <ui-item>Item 1</ui-item>
 *   <ui-item-separator></ui-item-separator>
 *   <ui-item>Item 2</ui-item>
 * </ui-item-group>
 * ```
 */
@customElement("ui-item-separator")
export class ItemSeparator extends TW(LitElement) {
  override render() {
    return html`
      <div
        data-slot="item-separator"
        class=${cn("bg-border h-px w-full", this.className)}
        role="separator"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-item": Item;
    "ui-item-group": ItemGroup;
    "ui-item-separator": ItemSeparator;
  }
}
