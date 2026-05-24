import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";
import { EditOverlay } from "@/components/EditOverlay";
import { Github, ExternalLink, Plus, Trash2, X, Check } from "lucide-react";
import { useApp, Project } from "@/contexts/AppContext";

function newProject(): Project {
  return { id: Date.now().toString(), name: '', position: 99, problem: '', architecture: [], stack: [], decisions: [], live_url: null, github_url: '' };
}

function ProjectEditDialog({ project, onSave, onClose }: { project: Project; onSave: (p: Project) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...project, architectureStr: project.architecture.join('\n'), stackStr: project.stack.join(', '), decisionsStr: project.decisions.join('\n') });

  const save = () => {
    onSave({ ...form, architecture: form.architectureStr.split('\n').map(s => s.trim()).filter(Boolean), stack: form.stackStr.split(',').map(s => s.trim()).filter(Boolean), decisions: form.decisionsStr.split('\n').map(s => s.trim()).filter(Boolean) });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="surface w-full max-w-2xl rounded-xl p-6 border border-primary/30 shadow-2xl my-8"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono font-bold">{form.id && project.name ? `Edit: ${project.name}` : 'Add Project'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Project Name', key: 'name', type: 'input' },
            { label: 'Position (sort order)', key: 'position', type: 'number' },
            { label: 'GitHub URL', key: 'github_url', type: 'input' },
            { label: 'Live URL', key: 'live_url', type: 'input' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type === 'number' ? 'number' : 'text'}
                value={((form as Record<string, unknown>)[key] as string | number | null) ?? ''}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground" />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Problem Statement</label>
            <textarea value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} rows={2}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Stack (comma-separated)</label>
            <textarea value={form.stackStr} onChange={e => setForm(f => ({ ...f, stackStr: e.target.value }))} rows={2}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Architecture (one per line)</label>
            <textarea value={form.architectureStr} onChange={e => setForm(f => ({ ...f, architectureStr: e.target.value }))} rows={2}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Key Decisions (one per line)</label>
            <textarea value={form.decisionsStr} onChange={e => setForm(f => ({ ...f, decisionsStr: e.target.value }))} rows={2}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-foreground resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded font-mono text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Check className="w-4 h-4" /> Save Project
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const { data, updateData, isAdmin, previewMode } = useApp();
  const projects = [...data.projects].sort((a, b) => a.position - b.position);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveProject = (p: Project) => {
    updateData(prev => {
      const exists = prev.projects.find(x => x.id === p.id);
      return { ...prev, projects: exists ? prev.projects.map(x => x.id === p.id ? p : x) : [...prev.projects, p] };
    });
    setEditingProject(null);
  };

  const deleteProject = (id: string) => {
    updateData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    setDeletingId(null);
  };

  const canEdit = isAdmin && !previewMode;

  return (
    <div className="min-h-[100dvh] pt-24 pb-16 px-4">
      {editingProject && <ProjectEditDialog project={editingProject} onSave={saveProject} onClose={() => setEditingProject(null)} />}
      {deletingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)}>
          <div className="surface rounded-xl p-6 border border-destructive/30 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-mono font-bold mb-2">Delete Project?</h3>
            <p className="text-muted-foreground text-sm mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded font-mono text-sm border border-border hover:bg-secondary text-muted-foreground transition-colors">Cancel</button>
              <button onClick={() => deleteProject(deletingId)} className="px-4 py-2 rounded font-mono text-sm bg-destructive text-foreground hover:bg-destructive/80 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl">
        <div className="flex items-start justify-between mb-8">
          <SectionHeader eyebrow="// projects" title="Architecture & Implementation" description="A selection of systems I've designed and built. Focus on reliability, scale, and maintainability." />
          {canEdit && (
            <button onClick={() => setEditingProject(newProject())}
              className="shrink-0 mt-2 flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          )}
        </div>

        <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <motion.div key={project.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <EditOverlay label="Project" onEdit={() => setEditingProject(project)} className="h-full">
                <div className="surface p-6 rounded-xl flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold tracking-tight">{project.name}</h3>
                    <div className="flex gap-1.5">
                      {canEdit && (
                        <button onClick={() => setDeletingId(project.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Delete project">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {project.github_url && <a href={project.github_url} className="text-muted-foreground hover:text-foreground transition-colors p-1" target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5" /></a>}
                      {project.live_url && <a href={project.live_url} className="text-muted-foreground hover:text-foreground transition-colors p-1" target="_blank" rel="noopener noreferrer"><ExternalLink className="w-5 h-5" /></a>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-secondary rounded text-xs font-mono text-muted-foreground border border-border">{tech}</span>
                    ))}
                  </div>
                  <div className="space-y-5 flex-1">
                    <div><h4 className="text-sm font-mono text-primary mb-1">Problem</h4><p className="text-sm text-muted-foreground">{project.problem}</p></div>
                    <div><h4 className="text-sm font-mono text-accent mb-1">Architecture</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">{project.architecture.map(i => <li key={i}>{i}</li>)}</ul>
                    </div>
                    <div><h4 className="text-sm font-mono text-success mb-1">Key Decisions</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">{project.decisions.map(i => <li key={i}>{i}</li>)}</ul>
                    </div>
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
