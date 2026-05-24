import { useState } from "react";
import { Link, useLocation } from "wouter";
import { X, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { EditOverlay } from "@/components/EditOverlay";
import { motion } from "framer-motion";

function BrandEditDialog({ onClose }: { onClose: () => void }) {
  const { data, updateData } = useApp();
  const [text, setText] = useState(data.brandText);
  const save = () => { updateData(prev => ({ ...prev, brandText: text })); onClose(); };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="surface w-full max-w-sm rounded-xl p-6 border border-primary/30 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono font-bold text-sm">Edit Brand Text</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <input value={text} onChange={e => setText(e.target.value)}
          className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded font-mono text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={save} className="px-3 py-1.5 rounded font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            <Check className="w-3 h-3" /> Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function SiteNav() {
  const [location] = useLocation();
  const { data } = useApp();
  const [editingBrand, setEditingBrand] = useState(false);

  if (location.startsWith("/admin")) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/certifications", label: "Certifications" },
    { href: "/lab", label: "↯ Systems Lab" },
    { href: "/about", label: "About" },
  ];

  return (
    <>
      {editingBrand && <BrandEditDialog onClose={() => setEditingBrand(false)} />}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-border bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <EditOverlay label="Brand" onEdit={() => setEditingBrand(true)}>
            <Link href="/" className="flex items-center gap-2 group p-1 rounded">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <span className="font-mono text-sm font-semibold group-hover:text-primary transition-colors">
                {data.brandText}
              </span>
            </Link>
          </EditOverlay>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-mono transition-colors ${
                  location === link.href ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
