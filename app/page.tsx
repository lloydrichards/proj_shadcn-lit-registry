import { CodeBlock } from "@/components/code-block";
import { CommandBlock } from "@/components/command-block";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RegistryItemRow } from "../components/registry_item_row";

const Home = async () => {
  const registryData = await import("@/registry.json");
  const registry = registryData.default;
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      <main className="flex flex-1 flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Lit Registry</h1>
            <p className="text-muted-foreground">
              A collection of web-components similar to Shadcn/ui
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">What is shadcn?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlike traditional component libraries, shadcn isn't installed as
              a dependency. Instead, it democratizes code by copying components
              directly into your codebase. This gives you full ownership and
              control, making it easy to customize, style, and modify components
              to fit your exact needs without being constrained by package
              updates or opinionated APIs.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This registry extends the shadcn concept to web-components using
              Lit, allowing you to integrate these components into your projects
              while enjoying the benefits of shadcn's approach to component
              ownership.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Getting Started</h2>
            <ol className="text-sm text-muted-foreground leading-relaxed list-decimal list-inside space-y-3">
              <li className="space-y-2">
                <strong className="text-foreground">
                  Configure components.json
                </strong>{" "}
                - Create a{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  components.json
                </code>{" "}
                file in your project root to configure shadcn paths and
                preferences:
                <div className="ml-8">
                  <CodeBlock
                    code={JSON.stringify(
                      {
                        $schema: "https://ui.shadcn.com/schema.json",
                        style: "new-york",
                        tailwind: {
                          config: "",
                          baseColor: "",
                          cssVariables: true,
                          css: "lib/styles/tailwind.global.css",
                        },
                        aliases: {
                          components: "@/components",
                          utils: "@/lib/utils",
                          ui: "@/components/ui",
                          lib: "@/lib",
                          hooks: "@/hooks",
                        },
                        registries: {
                          "@lit":
                            "https://lit-registry.lloydrichards.dev/r/{name}.json",
                        },
                      },
                      null,
                      2,
                    )}
                  />
                </div>
              </li>
              <li className="space-y-2">
                <strong className="text-foreground">
                  Install the TailwindMixin
                </strong>{" "}
                - Run the command below to add the required Tailwind integration
                for Lit components:
                <div className="ml-8">
                  <CommandBlock
                    command={"npx shadcn@latest add @lit/tailwind-mixin"}
                    name="tailwind-mixin"
                  />
                </div>
              </li>
              <li className="space-y-2">
                <strong className="text-foreground">
                  Create Tailwind Global CSS
                </strong>{" "}
                - Create a file at{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  lib/styles/tailwind.global.css
                </code>{" "}
                (or the path specified in your{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  components.json
                </code>{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  tailwind.css
                </code>{" "}
                field) and paste the following CSS:
                <div className="ml-8">
                  <CodeBlock
                    code={`@import "tailwindcss";
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
}`}
                  />
                </div>
              </li>
              <li>
                <strong className="text-foreground">Add components</strong> -
                Browse the registry below and copy the installation command for
                any component you need.
              </li>
            </ol>
          </div>
        </section>

        <Table className="table-fixed">
          <TableCaption>A list of all registry items</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Name</TableHead>
              <TableHead className="w-20 text-center">JSON</TableHead>
              <TableHead className="w-20 text-center">Storybook</TableHead>
              <TableHead className="text-center">cmd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-background border-b-0">
              <TableCell className="pt-8 text-xs uppercase">
                Component <span className="text-muted-foreground">Stories</span>
              </TableCell>
            </TableRow>
            {registry.items.map((item) => (
              <RegistryItemRow key={item.name} item={item} />
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
};

export default Home;
