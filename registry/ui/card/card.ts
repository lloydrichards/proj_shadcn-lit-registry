import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

@customElement("ui-card")
export class Card extends BaseElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`
      <div
        data-slot="card"
        class=${cn(
          "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-header")
export class CardHeader extends BaseElement {
  override render() {
    return html`
      <div
        data-slot="card-header"
        class=${cn(
          "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-[*[data-slot=card-action]]:grid-cols-[1fr_auto] [.border-b]:pb-6",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-title")
export class CardTitle extends BaseElement {
  override render() {
    return html`
      <div
        data-slot="card-title"
        class=${cn("leading-none font-semibold", this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-description")
export class CardDescription extends BaseElement {
  override render() {
    return html`
      <div
        data-slot="card-description"
        class=${cn("text-muted-foreground text-sm", this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-action")
export class CardAction extends BaseElement {
  override render() {
    return html`
      <div
        data-slot="card-action"
        class=${cn(
          "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
          this.className,
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-content")
export class CardContent extends BaseElement {
  override render() {
    return html`
      <div data-slot="card-content" class=${cn("px-6", this.className)}>
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-footer")
export class CardFooter extends BaseElement {
  override render() {
    return html`
      <div
        data-slot="card-footer"
        class=${cn("flex items-center px-6 [.border-t]:pt-6", this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-card": Card;
    "ui-card-header": CardHeader;
    "ui-card-title": CardTitle;
    "ui-card-description": CardDescription;
    "ui-card-action": CardAction;
    "ui-card-content": CardContent;
    "ui-card-footer": CardFooter;
  }
}
