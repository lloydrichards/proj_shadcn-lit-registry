import { type LitElement } from "lit";
declare global {
  // biome-ignore lint/suspicious/noExplicitAny: Mixin constructor requires any for class constructor args
  export type LitMixin<T = unknown> = new (...args: any[]) => T & LitElement;
}
export declare const TW: <T extends LitMixin>(superClass: T) => T;
