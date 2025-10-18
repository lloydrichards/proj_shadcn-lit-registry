"use client";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    toast("Copied to clipboard");
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <div className="relative my-2 group">
      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto pr-12">
        <code>{code}</code>
      </pre>
      <Button
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        data-umami-event="Copy code button"
        data-checked={copied}
      >
        <span className="sr-only">Copy code</span>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};
