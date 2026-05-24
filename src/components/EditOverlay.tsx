import { ReactNode, useState } from "react";
import { Pencil } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface EditOverlayProps {
  children: ReactNode;
  label: string;
  onEdit: () => void;
  className?: string;
}

export function EditOverlay({ children, label, onEdit, className = "" }: EditOverlayProps) {
  const { isAdmin, previewMode } = useApp();
  const [hovered, setHovered] = useState(false);

  if (!isAdmin || previewMode) return <>{children}</>;

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none z-10"
          style={{
            outline: "2px dashed oklch(0.78 0.18 165 / 0.6)",
            outlineOffset: "4px",
          }}
        />
      )}
      {children}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          data-testid={`edit-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold shadow-lg transition-all"
          style={{
            background: "oklch(0.78 0.18 165)",
            color: "oklch(0.12 0.02 260)",
          }}
        >
          <Pencil className="w-3 h-3" />
          Edit {label}
        </button>
      )}
    </div>
  );
}
