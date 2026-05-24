import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";
import { EditOverlay } from "@/components/EditOverlay";
import { Award, ExternalLink, Plus, Trash2, X, Check } from "lucide-react";
import { useApp, Certification } from "@/contexts/AppContext";

function newCert(): Certification {
  return { id: Date.now().toString(), name: '', issuer: '', year: new Date().getFullYear(), credential_url: '#', position: 99 };
}

function CertEditDialog({ cert, onSave, onClose }: { cert: Certification; onSave: (c: Certification) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...cert });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="surface w-full max-w-md rounded-xl p-6 border border-primary/30 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono font-bold">{form.name ? `Edit: ${form.name}` : 'Add Certification'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          {([
            { label: 'Certification Name', key: 'name', type: 'text' },
            { label: 'Issuer', key: 'issuer', type: 'text' },
            { label: 'Year', key: 'year', type: 'number' },
            { label: 'Credential URL', key: 'credential_url', type: 'text' },
            { label: 'Position', key: 'position', type: 'number' },
          ] as const).map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} value={(form as Record<string, unknown>)[key] as string ?? ''}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded font-mono text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Certifications() {
  const { data, updateData, isAdmin, previewMode } = useApp();
  const certs = [...data.certifications].sort((a, b) => a.position - b.position);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const canEdit = isAdmin && !previewMode;

  const saveCert = (c: Certification) => {
    updateData(prev => {
      const exists = prev.certifications.find(x => x.id === c.id);
      return { ...prev, certifications: exists ? prev.certifications.map(x => x.id === c.id ? c : x) : [...prev.certifications, c] };
    });
    setEditingCert(null);
  };

  const deleteCert = (id: string) => {
    updateData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
    setDeletingId(null);
  };

  return (
    <div className="min-h-[100dvh] pt-24 pb-16 px-4">
      {editingCert && <CertEditDialog cert={editingCert} onSave={saveCert} onClose={() => setEditingCert(null)} />}
      {deletingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)}>
          <div className="surface rounded-xl p-6 border border-destructive/30 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-mono font-bold mb-2">Delete Certification?</h3>
            <p className="text-muted-foreground text-sm mb-5">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded font-mono text-sm border border-border hover:bg-secondary text-muted-foreground transition-colors">Cancel</button>
              <button onClick={() => deleteCert(deletingId)} className="px-4 py-2 rounded font-mono text-sm bg-destructive text-foreground hover:bg-destructive/80 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl">
        <div className="flex items-start justify-between mb-8">
          <SectionHeader eyebrow="// certifications" title="Verified Expertise" description="Formal validations of systems knowledge and cloud infrastructure capabilities." />
          {canEdit && (
            <button onClick={() => setEditingCert(newCert())}
              className="shrink-0 mt-2 flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Cert
            </button>
          )}
        </div>

        <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((cert) => (
            <motion.div key={cert.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <EditOverlay label="Cert" onEdit={() => setEditingCert(cert)}>
                <div className="surface p-5 rounded-lg flex items-start gap-4 hover:border-primary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{cert.name}</h3>
                    <div className="flex items-center gap-3 mt-1 font-mono text-xs text-muted-foreground">
                      <span>{cert.issuer}</span><span>•</span><span>{cert.year}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canEdit && (
                      <button onClick={() => setDeletingId(cert.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors p-2">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </EditOverlay>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
