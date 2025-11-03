import { cva } from "class-variance-authority";
import { html, LitElement, type PropertyValues } from "lit";
import {
  customElement,
  property,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

export const avatarVariants = cva(
  "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
);

export interface AvatarProperties {
  src?: string;
  alt?: string;
  loading?: "eager" | "lazy";
}

@customElement("ui-avatar")
export class Avatar extends TW(LitElement) implements AvatarProperties {
  @property({ type: String }) src?: string;
  @property({ type: String }) alt = "";
  @property({ type: String }) loading: "eager" | "lazy" = "lazy";

  @state() private _imageLoaded = false;
  @state() private _imageError = false;

  @queryAssignedElements({ slot: "image", flatten: true })
  private _imageSlot!: HTMLElement[];

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("src")) {
      this._imageLoaded = false;
      this._imageError = false;
    }
  }

  private _handleImageLoad() {
    this._imageLoaded = true;
    this._imageError = false;
  }

  private _handleImageError() {
    this._imageLoaded = false;
    this._imageError = true;
  }

  private get _shouldShowImage(): boolean {
    return Boolean(this.src && this._imageLoaded && !this._imageError);
  }

  private get _shouldShowFallback(): boolean {
    return !this.src || this._imageError || !this._imageLoaded;
  }

  override render() {
    const hasImageSlot = this._imageSlot.length > 0;

    return html`
      <span class=${cn(avatarVariants(), this.className)}>
        <slot name="image"></slot>

        ${this.src && !hasImageSlot
          ? html`
              <img
                class="aspect-square h-full w-full object-cover"
                src=${this.src}
                alt=${this.alt}
                loading=${this.loading}
                @load=${this._handleImageLoad}
                @error=${this._handleImageError}
                style=${this._shouldShowImage ? "" : "display: none;"}
              />
            `
          : ""}
        ${this._shouldShowFallback
          ? html`
              <span
                class="flex h-full w-full items-center justify-center rounded-full bg-muted"
              >
                <slot></slot>
              </span>
            `
          : ""}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-avatar": Avatar;
  }
}
