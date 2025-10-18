import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  "stories": [
    "../registry/**/*.mdx",
    "../registry/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/web-components-vite",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;