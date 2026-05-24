import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";
import { EditOverlay } from "@/components/EditOverlay";
import { Terminal, X, Check, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

function AboutEditDialog({ onClose }: { onClose: () => void }) {
  const { data, updateData } = useApp();
  const [bio0, setBio0] = useState(data.about.bio[0] ?? "");
  const [bio1, setBio1] = useState(data.about.bio[1] ?? "");
  const [items, setItems] = useState(data.about.philosophyItems.map(i => ({ ...i })));
  const [skillGroups, setSkillGroups] = useState(data.about.skillGroups.map(group => ({ ...group, itemsText: group.items.join(", ") })));

  const save = () => {
    updateData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        bio: [bio0, bio1].filter(Boolean),
        philosophyItems: items,
        skillGroups: skillGroups
          .map(({ itemsText, ...group }) => ({
            ...group,
            category: group.category.trim(),
            items: itemsText.split(",").map(item => item.trim()).filter(Boolean),
          }))
          .filter(group => group.category && group.items.length > 0),
      },
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="surface w-full max-w-2xl rounded-xl p-6 border border-primary/30 shadow-2xl my-8"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono font-bold">Edit About Section</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Bio Paragraph 1</label>
            <textarea value={bio0} onChange={e => setBio0(e.target.value)} rows={3}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Bio Paragraph 2</label>
            <textarea value={bio1} onChange={e => setBio1(e.target.value)} rows={3}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Philosophy Items</p>
            {items.map((item, i) => (
              <div key={i} className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
                <input value={item.title} onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                  placeholder="Title" className="w-full bg-secondary border border-border rounded px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-primary text-foreground" />
                <textarea value={item.body} onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, body: e.target.value } : x))}
                  rows={2} placeholder="Body text"
                  className="w-full bg-secondary border border-border rounded px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Technical Stack Groups</p>
              <button
                onClick={() => setSkillGroups(prev => [...prev, { category: "", items: [], itemsText: "" }])}
                className="flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {skillGroups.map((group, i) => (
              <div key={`${group.category}-${i}`} className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    value={group.category}
                    onChange={e => setSkillGroups(prev => prev.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}
                    placeholder="Category"
                    className="flex-1 bg-secondary border border-border rounded px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                  <button
                    onClick={() => setSkillGroups(prev => prev.filter((_, j) => j !== i))}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={group.itemsText}
                  onChange={e => setSkillGroups(prev => prev.map((x, j) => j === i ? { ...x, itemsText: e.target.value } : x))}
                  rows={2}
                  placeholder="Comma-separated skills"
                  className="w-full bg-secondary border border-border rounded px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded font-mono text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = { primary: "border-primary", accent: "border-accent", success: "border-success" };
const TITLE_COLOR_MAP: Record<string, string> = { primary: "text-primary", accent: "text-accent", success: "text-success" };

export default function About() {
  const { data } = useApp();
  const { about } = data;
  const [editingAbout, setEditingAbout] = useState(false);

  return (
    <div className="min-h-[100dvh] pt-24 pb-16 px-4">
      {editingAbout && <AboutEditDialog onClose={() => setEditingAbout(false)} />}
      <div className="container mx-auto max-w-5xl">
        <SectionHeader eyebrow="// about_me" title="Systems over syntax." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          <EditOverlay label="About" onEdit={() => setEditingAbout(true)} className="lg:col-span-2">
            <div className="space-y-8 p-2 rounded-xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed">
                {about.bio.map((para, i) => <p key={i} className={i === 0 ? "text-lg" : ""}>{para}</p>)}

                <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">Engineering Philosophy</h3>
                <div className="space-y-6">
                  {about.philosophyItems.map((item) => (
                    <div key={item.title} className={`border-l-2 ${COLOR_MAP[item.color] ?? 'border-primary'} pl-4`}>
                      <h4 className={`font-mono text-sm ${TITLE_COLOR_MAP[item.color] ?? 'text-primary'} mb-2 uppercase tracking-wider`}>{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </EditOverlay>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="surface p-6 rounded-xl sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-foreground font-mono font-semibold">
                <Terminal className="w-5 h-5" /><span>Technical Stack</span>
              </div>
              <div className="space-y-6">
                {about.skillGroups.map((skillGroup) => (
                  <div key={skillGroup.category}>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{skillGroup.category}</div>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map(item => (
                        <span key={item} className="px-2 py-1 bg-secondary text-muted-foreground rounded-md text-xs font-mono border border-border hover:border-primary/50 transition-colors cursor-default">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
