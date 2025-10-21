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
                          css: "@/styles/tailwind.global.css",
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
              <li>
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
