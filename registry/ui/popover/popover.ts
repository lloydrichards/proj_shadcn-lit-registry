import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  type Placement,
  type Strategy,
  shift,
} from "@floating-ui/dom";
import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

@customElement("ui-popover")
export class Popover extends TW(LitElement) {
  @property() placement: Placement = "top";
  @property({ type: Number }) distance = 0;
  @property({ type: Number }) skidding = 0;
  @property({ type: Boolean }) flip = false;
  @property({ type: Boolean }) shift = false;
  @property({ type: Boolean }) arrow = false;
  @property({ type: Number }) arrowPadding = 0;
  @property() strategy: Strategy = "absolute";
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ attribute: false }) anchor?: Element | string;

  @query('[part="popup"]') popup!: HTMLElement;
  @query('[part="arrow"]') arrowElement?: HTMLElement;

  @state() private currentPlacement: Placement = "top";

  private cleanup?: () => void;
  private anchorEl?: Element | null;

  static styles = css`
    :host {
      display: contents;
    }
  `;

  override async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    this.handleAnchorChange();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
  }

  override async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("anchor")) {
      await this.handleAnchorChange();
    }

    if (changedProperties.has("active")) {
      if (this.active) {
        this.start();
      } else {
        this.stop();
      }
    }

    if (this.active) {
      await this.updateComplete;
      this.reposition();
    }
  }

  private async handleAnchorChange() {
    await this.stop();

    if (this.anchor && typeof this.anchor === "string") {
      const root = this.getRootNode() as Document | ShadowRoot;
      this.anchorEl = root.getElementById(this.anchor);
    } else if (this.anchor instanceof Element) {
      this.anchorEl = this.anchor;
    } else if (
      this.anchor &&
      typeof this.anchor === "object" &&
      "getBoundingClientRect" in this.anchor
    ) {
      this.anchorEl = this.anchor;
    } else {
      const slot = this.renderRoot.querySelector<HTMLSlotElement>(
        'slot[name="anchor"]',
      );
      this.anchorEl = slot?.assignedElements({ flatten: true })[0] || null;
    }

    if (this.anchorEl instanceof HTMLSlotElement) {
      this.anchorEl = this.anchorEl.assignedElements({
        flatten: true,
      })[0] as HTMLElement;
    }

    if (this.anchorEl && this.active) {
      this.start();
    }
  }

  private start() {
    if (!this.anchorEl || !this.popup) return;

    this.cleanup = autoUpdate(this.anchorEl, this.popup, () => {
      this.reposition();
    });
  }

  private async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = undefined;
        this.removeAttribute("data-current-placement");
        requestAnimationFrame(() => resolve());
      } else {
        resolve();
      }
    });
  }

  show() {
    this.active = true;
  }

  hide() {
    this.active = false;
  }

  toggle() {
    this.active = !this.active;
  }

  reposition() {
    if (!this.active || !this.anchorEl || !this.popup) return;

    const middleware = [
      offset({ mainAxis: this.distance, crossAxis: this.skidding }),
    ];

    if (this.flip) {
      middleware.push(flip());
    }

    if (this.shift) {
      middleware.push(shift({ padding: 5 }));
    }

    if (this.arrow && this.arrowElement) {
      middleware.push(
        arrow({ element: this.arrowElement, padding: this.arrowPadding }),
      );
    }

    computePosition(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware,
      strategy: this.strategy,
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(this.popup.style, {
        position: this.strategy,
        left: `${x}px`,
        top: `${y}px`,
      });

      this.currentPlacement = placement;
      this.setAttribute("data-current-placement", placement);

      if (this.arrow && this.arrowElement && middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;

        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right",
        }[placement.split("-")[0]] as string;

        Object.assign(this.arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          [staticSide]: "-4px",
        });
      }

      this.dispatchEvent(
        new CustomEvent("popover-reposition", {
          detail: { placement, x, y },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  override render() {
    return html`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>
      <div
        class=${cn("w-max z-50", this.active ? "" : "hidden", this.className)}
        part="popup"
        data-placement=${this.currentPlacement}
      >
        <slot></slot>
        ${
          this.arrow
            ? html`<div
              class="absolute w-2 h-2 rotate-45 bg-inherit -z-10"
              part="arrow"
            ></div>`
            : ""
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-popover": Popover;
  }

  interface HTMLElementEventMap {
    "popover-reposition": CustomEvent<{
      placement: Placement;
      x: number;
      y: number;
    }>;
  }
}
