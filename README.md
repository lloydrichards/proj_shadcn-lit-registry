# Shadcn Lit Component Registry

A component registry for Lit-based web components, designed to work seamlessly
with the shadcn CLI. This registry combines the power of Lit for creating fast,
lightweight web components with the utility-first approach of Tailwind CSS for
styling.

## Overview

This registry provides reusable Lit web components that can be easily installed
into your projects using the shadcn CLI. Unlike traditional React-based shadcn
registries, this registry focuses on framework-agnostic web components built
with Lit.

**Key benefits:**

- **Lit Components**: Leverage the performance and simplicity of Lit for
  building web components
- **Tailwind CSS Integration**: Utilize Tailwind's utility classes for rapid
  styling and customization
- **Shadcn CLI Compatibility**: Easily add and manage components using the
  familiar shadcn CLI
- **Framework Agnostic**: Use these components across different web projects,
  regardless of the framework

## How to Use

### Prerequisites

Ensure you have the shadcn CLI installed in your project. If not, create a
`components.json` file with the following:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "",
    "baseColor": "",
    "cssVariables": true,
    "css": "lib/styles/tailwind.global.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@lit": "https://lit-registry.lloydrichards.dev/r/{name}.json"
  }
}
```

### Setup Tailwind CSS

Before adding any components, you need to set up Tailwind CSS v4 for use with Lit web components.

#### 1. Install Tailwind Mixin

```bash
npx shadcn@latest add @lit/tailwind-mixin
```

#### 2. Create Tailwind Global CSS

Create a file at `lib/styles/tailwind.global.css` (or the path specified in your `components.json` `tailwind.css` field) with the following content:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-border: var(--_border);
  --color-input: var(--_input);
  --color-ring: var(--_ring);
  --color-background: var(--_background);
  --color-foreground: var(--_foreground);

  --color-card: var(--_card);
  --color-card-foreground: var(--_card-foreground);

  --color-popover: var(--_popover);
  --color-popover-foreground: var(--_popover-foreground);

  --color-primary: var(--_primary);
  --color-primary-foreground: var(--_primary-foreground);

  --color-secondary: var(--_secondary);
  --color-secondary-foreground: var(--_secondary-foreground);

  --color-muted: var(--_muted);
  --color-muted-foreground: var(--_muted-foreground);

  --color-accent: var(--_accent);
  --color-accent-foreground: var(--_accent-foreground);

  --color-destructive: var(--_destructive);
  --color-destructive-foreground: var(--_destructive-foreground);
}

@layer base {
  :root,
  :host {
    --_background: var(--background, oklch(1 0 0));
    --_foreground: var(--foreground, oklch(0.147 0.004 49.25));

    --_card: var(--card, oklch(1 0 0));
    --_card-foreground: var(--card-foreground, oklch(0.147 0.004 49.25));

    --_popover: var(--popover, oklch(1 0 0));
    --_popover-foreground: var(--popover-foreground, oklch(0.147 0.004 49.25));

    --_primary: var(--primary, oklch(0.216 0.006 56.043));
    --_primary-foreground: var(
      --primary-foreground,
      oklch(0.985 0.001 106.423)
    );

    --_secondary: var(--secondary, oklch(0.97 0.001 106.424));
    --_secondary-foreground: var(
      --secondary-foreground,
      oklch(0.216 0.006 56.043)
    );

    --_muted: var(--muted, oklch(0.97 0.001 106.424));
    --_muted-foreground: var(--muted-foreground, oklch(0.553 0.013 58.071));

    --_accent: var(--accent, oklch(0.97 0.001 106.424));
    --_accent-foreground: var(--accent-foreground, oklch(0.216 0.006 56.043));

    --_destructive: var(--destructive, oklch(0.577 0.245 27.325));
    --_destructive-foreground: var(
      --destructive-foreground,
      oklch(0.985 0.001 106.423)
    );

    --_border: var(--border, oklch(0.923 0.003 48.717));
    --_input: var(--input, oklch(0.923 0.003 48.717));
    --_ring: var(--ring, oklch(0.709 0.01 56.259));

    --_radius: var(--radius, 0.5rem);
  }

  .dark,
  :host(.dark),
  :host-context(.dark) {
    --_background: var(--background, oklch(0.147 0.004 49.25));
    --_foreground: var(--foreground, oklch(0.985 0.001 106.423));

    --_card: var(--card, oklch(0.216 0.006 56.043));
    --_card-foreground: var(--card-foreground, oklch(0.985 0.001 106.423));

    --_popover: var(--popover, oklch(0.216 0.006 56.043));
    --_popover-foreground: var(
      --popover-foreground,
      oklch(0.985 0.001 106.423)
    );

    --_primary: var(--primary, oklch(0.923 0.003 48.717));
    --_primary-foreground: var(--primary-foreground, oklch(0.216 0.006 56.043));

    --_secondary: var(--secondary, oklch(0.268 0.007 34.298));
    --_secondary-foreground: var(
      --secondary-foreground,
      oklch(0.985 0.001 106.423)
    );

    --_muted: var(--muted, oklch(0.268 0.007 34.298));
    --_muted-foreground: var(--muted-foreground, oklch(0.709 0.01 56.259));

    --_accent: var(--accent, oklch(0.268 0.007 34.298));
    --_accent-foreground: var(--accent-foreground, oklch(0.985 0.001 106.423));

    --_destructive: var(--destructive, oklch(0.704 0.191 22.216));
    --_destructive-foreground: var(
      --destructive-foreground,
      oklch(0.985 0.001 106.423)
    );

    --_border: var(--border, oklch(1 0 0 / 10%));
    --_input: var(--input, oklch(1 0 0 / 15%));
    --_ring: var(--ring, oklch(0.553 0.013 58.071));
  }
}

@layer root {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### 3. Verify Configuration

Ensure your `components.json` points to the correct CSS file:

```json
{
  "tailwind": {
    "css": "@/styles/tailwind.global.css"
  }
}
```

Or adjust the path in step 2 to match your `components.json` configuration.

### Adding Components

Install components from this registry using the shadcn CLI:

```bash
npx shadcn@latest add @lit/button

# Or install directly via URL
npx shadcn@latest add https://lit-registry.lloydrichards.dev/r/button.json
```

### Using Components

After installation, you can import and use the components in your project:

```typescript
import '@/components/ui/button';

// In your HTML or template
<ui-button variant="default">Click me</ui-button>
```

## Available Components

### Components

- **Button** - An atomic button component with multiple variants (default,
  destructive, outline, secondary, ghost, link) and sizes (default, sm, lg,
  icon)

### Libraries

- **Tailwind Mixin** - A set of Tailwind CSS mixins for Lit components, enabling
  easy integration of Tailwind styles within web components. This is a required
  dependency for most components in this registry.

## How to Contribute

We welcome contributions to expand and improve this component registry!

### Development Setup

1. Fork and clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Start Storybook for component development:

   ```bash
   npm run storybook
   ```

### Adding a New Component

1. Create your component in the `registry/ui/` directory (e.g.,
   `registry/ui/your-component.ts`)
2. Create a Storybook story for your component (e.g.,
   `registry/ui/your-component.stories.ts`)
3. Add your component definition to `registry.json`:

   ```json
   {
     "name": "your-component",
     "type": "registry:component",
     "title": "Your Component",
     "description": "Description of your component",
     "categories": ["ui", "web-component"],
     "dependencies": [],
     "files": [
       {
         "path": "registry/ui/your-component.ts",
         "type": "registry:ui"
       }
     ]
   }
   ```

4. Build the registry:

   ```bash
   npm run registry:build
   ```

5. Test your component locally and in Storybook

   ```bash
   bun dev

   # In another repo, add your component via local URL
   npx shadcn@latest add http://localhost:3000/r/your-component.json
   ```

6. Submit a pull request with your changes

### Testing

- Run tests: `npm run test`
- Run Storybook: `npm run storybook`
- Build registry: `npm run registry:build`

## Documentation

For more information on the technologies used in this project:

- [Shadcn CLI Documentation](https://ui.shadcn.com/docs/registry)
- [Lit Documentation](https://lit.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
