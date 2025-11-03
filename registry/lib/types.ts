/**
 * Shared type definitions for the component registry
 */

import type { LitElement } from "lit";

// Form-related types
export interface FormFieldValue {
  name: string;
  value: unknown;
}

export interface ValidationState {
  valid: boolean;
  message?: string;
  errors?: string[];
}

// Event types
export interface ComponentEvent<T = unknown> extends CustomEvent<T> {
  target: LitElement;
}

// Size variants used across components
export type Size = "sm" | "md" | "lg";

// Common component variants
export type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

// Orientation for components like tabs, separator
export type Orientation = "horizontal" | "vertical";

// Alignment options
export type Align = "start" | "center" | "end";

// Side for popovers, tooltips
export type Side = "top" | "right" | "bottom" | "left";

// Animation state
export type AnimationState =
  | "idle"
  | "entering"
  | "entered"
  | "exiting"
  | "exited";

// Slot configuration
export interface SlotConfig {
  name: string;
  fallback?: string;
}

// Focus options
export interface FocusConfig {
  trap?: boolean;
  returnFocus?: boolean;
  initialFocus?: string | HTMLElement;
}

// Keyboard navigation
export interface KeyboardConfig {
  escape?: boolean;
  tab?: boolean;
  arrow?: boolean;
  enter?: boolean;
  space?: boolean;
}

// Utility type for component variants from CVA
export type { VariantProps } from "class-variance-authority";
export { BaseElement } from "./base-element";
// Export component property interfaces
export type { FormElementProperties } from "./form-element";
