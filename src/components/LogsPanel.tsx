import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useConnectionStore } from "@/state/connectionStore";

/**
 * Collapsed by default, showing Aether's raw output. This is the fallback
 * the backend leans on when status classification can't keep up with an
 * upstream wording change (see aether/pty.rs) — every log line streams here
 * unconditionally, independent of whether the status state machine
 * correctly interpreted it.
 */
export function LogsPanel() {
  const logs = useConnectionStore((s) => s.logs);
  const [open, setOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm">
      <CollapsibleTrigger className="flex w-full items-center justify-center gap-1 py-2 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary rounded-md">
        Advanced / Logs
        <ChevronDown
          size={14}
          className="transition-transform duration-200 data-[state=open]:rotate-180"
          data-state={open ? "open" : "closed"}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out]">
        <div
          ref={viewportRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
          }}
          className="max-h-64 overflow-y-auto rounded-md bg-surface-1 p-2 font-mono text-xs text-muted-foreground"
        >
          {logs.length === 0 ? (
            <p className="text-status-idle">No output yet.</p>
          ) : (
            logs.map((l, i) => <p key={i}>{l.line}</p>)
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
