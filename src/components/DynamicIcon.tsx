import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";

export function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return <HelpCircle className={className} />;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }> | undefined;
  if (!Icon) return <HelpCircle className={className} />;
  return <Icon className={className} />;
}
