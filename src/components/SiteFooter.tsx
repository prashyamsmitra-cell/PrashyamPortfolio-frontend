import { useState } from "react";
import { Github, Linkedin, Twitter, Instagram, X as XIcon, Check, Plus, Trash2, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { EditOverlay } from "@/components/EditOverlay";
import { motion } from "framer-motion";

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: Github, LinkedIn: Linkedin, Twitter: Twitter, Instagram: Instagram, X: XIcon,
};

function SocialsEditDialog({ onClose }: { onClose: () => void }) {
  const { data, updateData } = useApp();
  const [socials, setSocials] = useState(data.socials.map(s => ({ ...s })));
  const [name, setName] = useState(data.copyrightName);

  const save = () => {
    updateData(prev => ({ ...prev, socials, copyrightName: name }));
    onClose();
  };

  const add = () => setSocials(prev => [...prev, { id: Date.now().toString(), platform: 'GitHub', url: '#', position: prev.length + 1 }]);
  const remove = (id: string) => setSocials(prev => prev.filter(s => s.id !== id));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="surface w-full max-w-md rounded-xl p-6 border border-primary/30 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono font-bold">Edit Footer</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Copyright Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Social Links</label>
              <button onClick={add} className="flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {socials.map((social) => (
                <div key={social.id} className="flex gap-2 items-center">
                  <input value={social.platform} onChange={e => setSocials(prev => prev.map(s => s.id === social.id ? { ...s, platform: e.target.value } : s))}
                    placeholder="Platform" className="w-28 bg-secondary border border-border rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-primary text-foreground" />
                  <input value={social.url} onChange={e => setSocials(prev => prev.map(s => s.id === social.id ? { ...s, url: e.target.value } : s))}
                    placeholder="URL" className="flex-1 bg-secondary border border-border rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-primary text-foreground" />
                  <button onClick={() => remove(social.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded font-mono text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function SiteFooter() {
  const { data } = useApp();
  const [editingFooter, setEditingFooter] = useState(false);

  return (
    <>
      {editingFooter && <SocialsEditDialog onClose={() => setEditingFooter(false)} />}
      <EditOverlay label="Footer" onEdit={() => setEditingFooter(true)}>
        <footer className="border-t border-border mt-24 py-8 bg-background">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" style={{ boxShadow: '0 0 8px oklch(0.78 0.18 155)' }} />
              <span className="text-xs text-muted-foreground font-mono">all systems nominal</span>
            </div>
            <div className="flex items-center gap-6">
              {data.socials.sort((a, b) => a.position - b.position).map((social) => {
                const Icon = PLATFORM_ICONS[social.platform] ?? Github;
                return (
                  <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-social-${social.platform.toLowerCase()}`}>
                    <span className="sr-only">{social.platform}</span>
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              &copy; {new Date().getFullYear()} {data.copyrightName}
            </div>
          </div>
        </footer>
      </EditOverlay>
    </>
  );
}
