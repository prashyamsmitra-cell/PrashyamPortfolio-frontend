import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Terminal, X, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { EditOverlay } from "@/components/EditOverlay";

function HeroEditDialog({ onClose }: { onClose: () => void }) {
  const { data, updateData } = useApp();
  const [heading, setHeading] = useState(data.hero.heading);
  const [subheading, setSubheading] = useState(data.hero.subheading);
  const [philosophy, setPhilosophy] = useState(data.hero.philosophy);

  const save = () => {
    updateData(prev => ({ ...prev, hero: { heading, subheading, philosophy } }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface w-full max-w-xl rounded-xl p-6 border border-primary/30 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono font-bold text-foreground">Edit Hero Section</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Main Heading</label>
            <textarea
              value={heading}
              onChange={e => setHeading(e.target.value)}
              rows={3}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors text-foreground resize-none"
              data-testid="input-hero-heading"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Subheading</label>
            <textarea
              value={subheading}
              onChange={e => setSubheading(e.target.value)}
              rows={2}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors text-foreground resize-none"
              data-testid="input-hero-subheading"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Philosophy Quote</label>
            <input
              value={philosophy}
              onChange={e => setPhilosophy(e.target.value)}
              className="w-full bg-secondary border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
              data-testid="input-hero-philosophy"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded font-mono text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2" data-testid="button-save-hero">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { data } = useApp();
  const { hero } = data;
  const [editingHero, setEditingHero] = useState(false);

  return (
    <div className="min-h-[100dvh] pt-24 pb-16 px-4">
      {editingHero && <HeroEditDialog onClose={() => setEditingHero(false)} />}

      <div className="container mx-auto max-w-5xl">
        <EditOverlay label="Hero" onEdit={() => setEditingHero(true)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-2 rounded-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                {hero.heading.split('real-world scalable systems').length > 1 ? (
                  <>
                    {hero.heading.split('real-world scalable systems')[0]}
                    <span className="text-gradient">real-world scalable systems</span>
                    {hero.heading.split('real-world scalable systems')[1]}
                  </>
                ) : (
                  <span className="text-gradient">{hero.heading}</span>
                )}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">{hero.subheading}</p>
              <div className="flex items-center gap-4">
                <Link href="/projects" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-mono text-sm font-medium transition-colors inline-flex items-center gap-2">
                  View Projects <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/lab" className="border border-border hover:bg-secondary px-6 py-3 rounded-md font-mono text-sm font-medium transition-colors inline-flex items-center gap-2">
                  Systems Lab <Terminal className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="surface p-4 rounded-xl font-mono text-sm overflow-hidden glow"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
                <div className="ml-2 text-xs text-muted-foreground">zsh — 80x24</div>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <span className="text-success">➜</span> <span className="text-info">~</span> <span className="text-foreground">whoami</span>
                  <div className="mt-1">systems-engineer</div>
                </div>
                <div>
                  <span className="text-success">➜</span> <span className="text-info">~</span> <span className="text-foreground">ls ./skills</span>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['distributed-systems', 'databases', 'async-queues', 'realtime', 'kubernetes', 'ai-pipelines'].map(s => (
                      <span key={s} className="text-primary">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-success">➜</span> <span className="text-info">~</span> <span className="text-foreground">cat ./philosophy.md</span>
                  <div className="mt-1 text-accent border-l-2 border-border pl-2 py-1 italic">{hero.philosophy}</div>
                </div>
                <div className="animate-pulse">
                  <span className="text-success">➜</span> <span className="text-info">~</span>{" "}
                  <span className="inline-block w-2 h-4 bg-foreground/50 ml-1 translate-y-1" />
                </div>
              </div>
            </motion.div>
          </div>
        </EditOverlay>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-32"
        >
          <div className="font-mono text-sm text-primary mb-6 uppercase tracking-wider">// core_competencies</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'High-Throughput APIs', desc: 'Designing REST and gRPC services capable of handling thousands of requests per second with sub-100ms P99 latency.', color: 'text-primary', bg: 'bg-primary/10' },
              { title: 'Data Architecture', desc: 'Complex PostgreSQL schemas, Redis caching layers, and real-time streaming architectures using CQRS and Event Sourcing.', color: 'text-accent', bg: 'bg-accent/10' },
              { title: 'Infrastructure', desc: 'Containerized deployments via Docker and Kubernetes, orchestrated with Terraform and CI/CD pipelines.', color: 'text-success', bg: 'bg-success/10' },
            ].map(card => (
              <div key={card.title} className="surface p-6 rounded-xl hover:-translate-y-1 transition-transform">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
                  <Terminal className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-16 surface p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Interactive Systems Lab</h3>
            <p className="text-sm text-muted-foreground mt-1">Experience live demonstrations of rate limiting, caching, and async queues.</p>
          </div>
          <Link href="/lab" className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-md font-mono text-sm font-medium transition-colors whitespace-nowrap">
            Initialize Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
