import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="flex flex-row items-center justify-between px-4 py-2">
      <Button variant="link" asChild>
        <a href="https://www.lloydrichards.dev" target="_blank" rel="noopener">
          lloydrichards.dev
        </a>
      </Button>
      <Button variant="link" asChild>
        <a
          href="https://github.com/lloydrichards/proj_shadcn-lit-registry"
          target="_blank"
          rel="noopener"
        >
          <Code2 size={24} /> Repo
        </a>
      </Button>
    </footer>
  );
};
