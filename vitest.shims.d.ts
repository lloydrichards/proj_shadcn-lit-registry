/// <reference types="@vitest/browser/providers/playwright" />

declare module "*.css?inline" {
  const content: string;
  export default content;
}
