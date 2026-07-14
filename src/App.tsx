import { useEffect } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { ConnectionStatusLine } from "@/components/ConnectionStatusLine";
import { ProtocolSelect } from "@/components/ProtocolSelect";
import { LogsPanel } from "@/components/LogsPanel";
import { SidecarErrorScreen } from "@/components/SidecarErrorScreen";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initConnectionListeners, useConnectionStore } from "@/state/connectionStore";

function MainScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <ConnectButton />
      <ConnectionStatusLine />
      <ProtocolSelect />
      <div className="flex-1" />
      <LogsPanel />
    </div>
  );
}

export function App() {
  const sidecarError = useConnectionStore((s) => s.sidecarError);
  const retryAfterSidecarError = useConnectionStore((s) => s.retryAfterSidecarError);
  const connect = useConnectionStore((s) => s.connect);

  useEffect(() => {
    const cleanup = initConnectionListeners();
    return () => {
      void cleanup.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <TooltipProvider>
      {sidecarError ? (
        <SidecarErrorScreen
          message={sidecarError}
          onRetry={() => {
            retryAfterSidecarError();
            void connect();
          }}
        />
      ) : (
        <MainScreen />
      )}
    </TooltipProvider>
  );
}

export default App;
