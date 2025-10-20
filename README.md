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
  "tailwind": {
    "css": "@/styles/tailwind.global.css"
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

### Add Tailwind Mixin

Before adding any components, ensure you have the Tailwind Mixin library
installed, as it is a required dependency for most components in this registry:

```bash
npx shadcn@latest add @lit/tailwind-mixin
```

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
