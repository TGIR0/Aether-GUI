import { useEffect, useState } from "react";
import { useConnectionStore } from "@/state/connectionStore";

function useElapsed(sinceMs: number | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (sinceMs == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sinceMs]);
  if (sinceMs == null) return "";
  const total = Math.max(0, Math.floor((now - sinceMs) / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * All status text stays in the two neutral greys (--foreground /
 * --muted-foreground) regardless of connection state — only the
 * ConnectButton's ring/icon carries status color. This sidesteps every
 * marginal-contrast case a semantic status color would hit as small text
 * (verified during design: idle-grey as text measures 4.02:1, just under
 * AA's 4.5:1 minimum).
 */
export function ConnectionStatusLine() {
  const status = useConnectionStore((s) => s.status);
  const connectedAt = status.state === "Connected" ? status.connected_at_ms : null;
  const elapsed = useElapsed(connectedAt);

  let primary: string;
  let secondary: string;

  switch (status.state) {
    case "Idle":
      primary = "Disconnected";
      secondary = "Click to connect";
      break;
    case "Launching":
      primary = "Starting Aether…";
      secondary = "Answering setup prompts";
      break;
    case "Connecting":
      primary = "Finding a route…";
      secondary = "This can take up to a couple of minutes";
      break;
    case "Connected":
      primary = "Connected";
      secondary = elapsed;
      break;
    case "Disconnecting":
      primary = "Disconnecting…";
      secondary = "";
      break;
    case "Error":
      primary = "Connection failed";
      secondary = status.message;
      break;
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center gap-1 text-center"
    >
      <span className="text-base font-medium text-foreground">{primary}</span>
      <span className="min-h-5 max-w-xs truncate font-mono text-xs text-muted-foreground">
        {secondary}
      </span>
    </div>
  );
}
