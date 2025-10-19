import type { Placement } from "@floating-ui/dom";
import { cva } from "class-variance-authority";
import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { TW } from "@/lib/tailwindMixin";
import { cn } from "@/lib/utils";
import "../popover/popover";
import type { Popover as PopupElement } from "../popover/popover";

const tooltipVariants = cva(
  "max-w-80 z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
  {
    variants: {
      placement: {
        top: "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
        bottom: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        left: "animate-in fade-in-0 zoom-in-95 slide-in-from-right-2",
        right: "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
      },
    },
  },
);

export interface TooltipProperties {
  content?: string;
  placement?: Placement;
  disabled?: boolean;
  distance?: number;
  open?: boolean;
  skidding?: number;
  trigger?: string;
  hoist?: boolean;
}

@customElement("ui-tooltip")
export class Tooltip extends TW(LitElement) implements TooltipProperties {
  @property() content = "";
  @property() placement: Placement = "top";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Number }) distance = 8;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Number }) skidding = 0;
  @property() trigger = "hover focus";
  @property({ type: Boolean }) hoist = false;

  @query("ui-popover") private popup!: PopupElement;

  @state() private currentPlacement: Placement = "top";

  private hoverTimeout?: number;

  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  constructor() {
    super();
    this.addEventListener("blur", this.handleBlur, true);
    this.addEventListener("focus", this.handleFocus, true);
    this.addEventListener("click", this.handleClick);
    this.addEventListener("mouseenter", this.handleMouseEnter);
    this.addEventListener("mouseleave", this.handleMouseLeave);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.clearHoverTimeout();
  }

  override firstUpdated() {
    if (this.open && !this.disabled) {
      this.popup.active = true;
      this.popup.reposition();
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      if (this.open && !this.disabled) {
        this.handleShow();
      } else {
        this.handleHide();
      }
    }

    if (changedProperties.has("disabled") && this.disabled && this.open) {
      this.hide();
    }

    if (
      this.hasUpdated &&
      (changedProperties.has("content") ||
        changedProperties.has("distance") ||
        changedProperties.has("hoist") ||
        changedProperties.has("placement") ||
        changedProperties.has("skidding"))
    ) {
      this.updateComplete.then(() => {
        this.popup?.reposition();
      });
    }
  }

  private clearHoverTimeout() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = undefined;
    }
  }

  private handleBlur = () => {
    if (this.hasTrigger("focus")) {
      this.hide();
    }
  };

  private handleClick = () => {
    if (this.hasTrigger("click")) {
      if (this.open) {
        this.hide();
      } else {
        this.show();
      }
    }
  };

  private handleFocus = () => {
    if (this.hasTrigger("focus")) {
      this.show();
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.open && event.key === "Escape") {
      event.stopPropagation();
      this.hide();
    }
  };

  private handleMouseEnter = () => {
    if (this.hasTrigger("hover")) {
      this.clearHoverTimeout();
      this.hoverTimeout = window.setTimeout(() => this.show(), 700);
    }
  };

  private handleMouseLeave = () => {
    if (this.hasTrigger("hover")) {
      this.clearHoverTimeout();
      this.hoverTimeout = window.setTimeout(() => this.hide(), 100);
    }
  };

  private handlePopupReposition = (
    e: CustomEvent<{ placement: Placement }>,
  ) => {
    this.currentPlacement = e.detail.placement;
  };

  private handleShow() {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("tooltip-show", {
        bubbles: true,
        composed: true,
      }),
    );

    this.popup.active = true;
    this.popup.reposition();

    this.dispatchEvent(
      new CustomEvent("tooltip-after-show", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleHide() {
    this.dispatchEvent(
      new CustomEvent("tooltip-hide", {
        bubbles: true,
        composed: true,
      }),
    );

    this.popup.active = false;

    this.dispatchEvent(
      new CustomEvent("tooltip-after-hide", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private hasTrigger(triggerType: string) {
    const triggers = this.trigger.split(" ");
    return triggers.includes(triggerType);
  }

  show() {
    if (this.open) return;
    this.open = true;
  }

  hide() {
    if (!this.open) return;
    this.open = false;
  }

  override render() {
    const placementVariant = this.currentPlacement.split("-")[0] as
      | "top"
      | "bottom"
      | "left"
      | "right";

    return html`
      <ui-popover
        placement=${this.placement}
        .distance=${this.distance}
        .skidding=${this.skidding}
        strategy=${this.hoist ? "fixed" : "absolute"}
        ?active=${this.open}
        .flip=${true}
        .shift=${true}
        @popover-reposition=${this.handlePopupReposition}
      >
        <slot slot="anchor" aria-describedby="tooltip"></slot>

        <div
          part="body"
          id="tooltip"
          class=${cn(
            tooltipVariants({
              placement: this.open ? placementVariant : undefined,
            }),
          )}
          role="tooltip"
          aria-live=${this.open ? "polite" : "off"}
        >
          <slot name="content">${this.content}</slot>
        </div>
      </ui-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-tooltip": Tooltip;
  }

  interface HTMLElementEventMap {
    "tooltip-show": CustomEvent;
    "tooltip-after-show": CustomEvent;
    "tooltip-hide": CustomEvent;
    "tooltip-after-hide": CustomEvent;
  }
}
