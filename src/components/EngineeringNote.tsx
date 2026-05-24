import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EngineeringNoteProps {
  title: string;
  children: React.ReactNode;
}

export function EngineeringNote({ title, children }: EngineeringNoteProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-secondary/30 overflow-hidden my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 hover:bg-secondary/50 transition-colors text-left"
        data-testid={`button-note-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Info className="w-4 h-4 text-info" />
        <span className="font-mono text-sm flex-1">Engineering Note: {title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border/50 text-sm text-muted-foreground leading-relaxed terminal">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
