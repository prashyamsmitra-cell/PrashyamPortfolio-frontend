import { useEffect, useRef } from "react";

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'allow' | 'block' | 'hit' | 'miss' | 'info' | 'error';
}

interface LogPanelProps {
  entries: LogEntry[];
}

export function LogPanel({ entries }: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const colorMap = {
    allow: "text-success",
    block: "text-destructive",
    hit: "text-success",
    miss: "text-warning",
    info: "text-info",
    error: "text-destructive"
  };

  return (
    <div 
      className="surface rounded-lg border border-border p-3 font-mono text-xs h-48 overflow-y-auto"
      ref={scrollRef}
      data-testid="log-panel"
    >
      {entries.length === 0 ? (
        <div className="text-muted-foreground opacity-50 italic">Waiting for logs...</div>
      ) : (
        <div className="flex flex-col gap-1">
          {entries.map((entry) => (
            <div key={entry.id} className="flex gap-3 whitespace-nowrap">
              <span className="text-muted-foreground shrink-0">{entry.time}</span>
              <span className={`shrink-0 uppercase w-12 ${colorMap[entry.type]}`}>[{entry.type}]</span>
              <span className="text-foreground truncate">{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
