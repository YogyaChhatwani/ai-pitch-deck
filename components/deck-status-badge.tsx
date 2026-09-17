import { DeckStatus } from "@/lib/generated/prisma/enums";
import { Badge } from "./ui/badge";

const statusVariants: Record<
  DeckStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  GENERATED: "default",
  GENERATING: "default",
  COMPLETED: "outline",
  FAILED: "destructive",
};

export function DeckStatusBadge({ status }: { status: DeckStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
