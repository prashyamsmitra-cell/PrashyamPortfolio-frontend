import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";
import { Metric } from "@/components/Metric";
import { LogPanel, LogEntry } from "@/components/LogPanel";
import { EngineeringNote } from "@/components/EngineeringNote";
import { TokenBucket } from "@/lib/token-bucket";
import { CacheService } from "@/lib/cache-service";
import { Play, Square, RefreshCcw, Database, Zap, Clock, Activity, Cpu } from "lucide-react";

export default function Lab() {
  const [highTraffic, setHighTraffic] = useState(false);

  // === RATE LIMITER DEMO ===
  const [rps, setRps] = useState(5);
  const [capacity, setCapacity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rlLogs, setRlLogs] = useState<LogEntry[]>([]);
  const [rlMetrics, setRlMetrics] = useState({ allowed: 0, blocked: 0, currentTokens: capacity });
  const bucketRef = useRef<TokenBucket>(new TokenBucket(capacity, rps));
  const rlIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    bucketRef.current.reconfigure(capacity, rps);
  }, [rps, capacity]);

  const addRlLog = useCallback((type: 'allow' | 'block', message: string) => {
    const id = Math.random().toString(36).substring(7);
    const time = new Date().toISOString().substring(11, 19);
    setRlLogs(prev => [...prev, { id, time, type, message }].slice(-50));
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const currentRps = highTraffic ? rps * 3 : rps;
      const intervalMs = 1000 / currentRps;
      
      rlIntervalRef.current = window.setInterval(() => {
        const allowed = bucketRef.current.allow();
        
        setRlMetrics(prev => ({
          allowed: allowed ? prev.allowed + 1 : prev.allowed,
          blocked: allowed ? prev.blocked : prev.blocked + 1,
          currentTokens: bucketRef.current.peek()
        }));
        
        addRlLog(allowed ? 'allow' : 'block', `Req ${Math.random().toString(36).substring(7, 11)}: ${allowed ? 'Forwarded' : 'Rate limited'}`);
        
      }, intervalMs);
      
      return () => {
        if (rlIntervalRef.current) clearInterval(rlIntervalRef.current);
      };
    } else {
      const tokenInterval = window.setInterval(() => {
        setRlMetrics(prev => ({ ...prev, currentTokens: bucketRef.current.peek() }));
      }, 500);
      return () => clearInterval(tokenInterval);
    }
  }, [isGenerating, rps, highTraffic, addRlLog]);


  // === CACHE DEMO ===
  const cacheRef = useRef<CacheService<string>>(new CacheService(5000));
  const [cacheLogs, setCacheLogs] = useState<LogEntry[]>([]);
  const [cacheMetrics, setCacheMetrics] = useState({ hits: 0, misses: 0, avgCacheLatency: 0, avgDbLatency: 0, totalCacheLat: 0, totalDbLat: 0 });
  const [isFetching, setIsFetching] = useState(false);

  const addCacheLog = useCallback((type: 'hit' | 'miss', message: string) => {
    const id = Math.random().toString(36).substring(7);
    const time = new Date().toISOString().substring(11, 19);
    setCacheLogs(prev => [...prev, { id, time, type, message }].slice(-50));
  }, []);

  const handleFetchKey = async (key: string) => {
    setIsFetching(true);
    const baseLatency = highTraffic ? 700 : 350;
    const fetcher = async () => {
      const lat = baseLatency + (Math.random() * 100 - 50);
      await new Promise(r => setTimeout(r, lat));
      return { value: `data_for_${key}`, latencyMs: Math.floor(lat) };
    };

    const res = await cacheRef.current.get(key, fetcher);
    
    setCacheMetrics(prev => {
      const isHit = res.source === 'cache';
      const hits = isHit ? prev.hits + 1 : prev.hits;
      const misses = !isHit ? prev.misses + 1 : prev.misses;
      
      const totalCacheLat = isHit ? prev.totalCacheLat + res.latencyMs : prev.totalCacheLat;
      const totalDbLat = !isHit ? prev.totalDbLat + res.latencyMs : prev.totalDbLat;
      
      return {
        hits,
        misses,
        totalCacheLat,
        totalDbLat,
        avgCacheLatency: hits > 0 ? Math.floor(totalCacheLat / hits) : 0,
        avgDbLatency: misses > 0 ? Math.floor(totalDbLat / misses) : 0
      };
    });

    addCacheLog(res.source === 'cache' ? 'hit' : 'miss', `GET ${key} -> ${res.latencyMs}ms (${res.source.toUpperCase()})`);
    setIsFetching(false);
  };


  // === QUEUE DEMO ===
  interface Job {
    id: string; name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: number; updatedAt: number;
  }
  const JOB_NAMES = ["send-welcome-email", "thumbnail.resize", "report.generate", "embeddings.index", "webhook.dispatch"];
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workerActive, setWorkerActive] = useState(false);
  const [queueLogs, setQueueLogs] = useState<LogEntry[]>([]);
  const workerIntervalRef = useRef<number | null>(null);

  const addQueueLog = useCallback((type: 'info' | 'error' | 'allow', message: string) => {
    const id = Math.random().toString(36).substring(7);
    const time = new Date().toISOString().substring(11, 19);
    setQueueLogs(prev => [...prev, { id, time, type, message }].slice(-50));
  }, []);

  const handleEnqueue = () => {
    const newJob: Job = {
      id: `job-${Math.random().toString(36).substring(2, 8)}`,
      name: JOB_NAMES[Math.floor(Math.random() * JOB_NAMES.length)],
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setJobs(prev => [...prev, newJob]);
    addQueueLog('info', `Enqueued: ${newJob.id} (${newJob.name})`);
  };

  useEffect(() => {
    if (!workerActive) return;
    {
      workerIntervalRef.current = window.setInterval(() => {
        setJobs(currentJobs => {
          const pending = currentJobs.find(j => j.status === 'pending');
          if (!pending) return currentJobs;
          
          // Move to processing
          const updatedToProcessing = currentJobs.map(j => 
            j.id === pending.id ? { ...j, status: 'processing' as const, updatedAt: Date.now() } : j
          );
          
          addQueueLog('info', `Processing: ${pending.id}`);
          
          // Complete it after a delay
          const processTime = Math.random() * 700 + 200;
          setTimeout(() => {
            setJobs(latestJobs => {
              const failRate = highTraffic ? 0.10 : 0.02;
              const isFailed = Math.random() < failRate;
              
              if (isFailed) {
                addQueueLog('error', `Failed: ${pending.id}`);
              } else {
                addQueueLog('allow', `Completed: ${pending.id} in ${Math.floor(processTime)}ms`);
              }
              
              return latestJobs.map(j => 
                j.id === pending.id ? { 
                  ...j, 
                  status: isFailed ? 'failed' as const : 'completed' as const, 
                  updatedAt: Date.now() 
                } : j
              );
            });
          }, processTime);

          return updatedToProcessing;
        });
      }, 800);
      
      return () => {
        if (workerIntervalRef.current) clearInterval(workerIntervalRef.current);
      };
    }
  }, [workerActive, highTraffic, addQueueLog]);


  return (
    <div className="min-h-[100dvh] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <SectionHeader 
            eyebrow="// systems_lab" 
            title="Interactive Architecture" 
            description="Live, in-browser simulations of core distributed systems patterns."
          />
          
          <div className="surface p-3 rounded-lg flex items-center gap-3 border-warning/30">
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">High Traffic Mode</span>
            <button 
              onClick={() => setHighTraffic(!highTraffic)}
              className={`w-12 h-6 rounded-full relative transition-colors ${highTraffic ? 'bg-warning' : 'bg-secondary'}`}
              data-testid="toggle-high-traffic"
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-all ${highTraffic ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="space-y-24">
          
          {/* Rate Limiter Demo */}
          <section id="rate-limiter" className="scroll-mt-24">
            <div className="font-mono text-sm text-primary mb-6 uppercase tracking-wider">// rate-limiter</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 surface p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Token Bucket Algorithm</h3>
                  <button 
                    onClick={() => setIsGenerating(!isGenerating)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors ${isGenerating ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'}`}
                    data-testid="button-rl-toggle"
                  >
                    {isGenerating ? <><Square className="w-4 h-4" /> Stop Traffic</> : <><Play className="w-4 h-4" /> Start Generator</>}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-muted-foreground flex justify-between">
                      <span>Refill Rate (RPS)</span>
                      <span className="text-foreground">{rps}/s</span>
                    </label>
                    <input 
                      type="range" min="1" max="30" value={rps} onChange={e => setRps(parseInt(e.target.value))}
                      className="w-full accent-primary" 
                      data-testid="input-rl-rps"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-muted-foreground flex justify-between">
                      <span>Bucket Capacity</span>
                      <span className="text-foreground">{capacity} tokens</span>
                    </label>
                    <input 
                      type="range" min="5" max="50" value={capacity} onChange={e => setCapacity(parseInt(e.target.value))}
                      className="w-full accent-primary"
                      data-testid="input-rl-capacity"
                    />
                  </div>
                </div>

                <div className="h-32 bg-background/50 rounded-lg border border-border p-4 relative overflow-hidden flex items-center justify-between">
                  <div className="w-16 h-16 rounded border-2 border-dashed border-muted-foreground flex items-center justify-center bg-secondary/50 z-10">
                    <Activity className="text-muted-foreground w-6 h-6" />
                  </div>
                  
                  {isGenerating && (
                    <motion.div 
                      className="absolute left-20 right-20 h-0.5 bg-primary/20"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-primary -mt-[3px]"
                        animate={{ x: ["0%", "400%"] }}
                        transition={{ repeat: Infinity, duration: 1/rps, ease: "linear" }}
                      />
                    </motion.div>
                  )}
                  
                  <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10 shadow-[0_0_15px_oklch(var(--primary)/0.2)] z-10">
                    <div className="text-center font-mono">
                      <div className="text-2xl font-bold">{rlMetrics.currentTokens}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Tokens</div>
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 rounded border border-border flex items-center justify-center bg-secondary z-10">
                    <Database className="text-foreground w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Metric label="Allowed" value={rlMetrics.allowed} color="success" />
                  <Metric label="Blocked" value={rlMetrics.blocked} color="destructive" />
                  <Metric label="Active RPS" value={isGenerating ? (highTraffic ? rps * 3 : rps) : 0} color={highTraffic ? "warning" : "primary"} />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <LogPanel entries={rlLogs} />
                <EngineeringNote title="Token Bucket Limiter">
                  The Token Bucket algorithm allows bursts of traffic up to the bucket's capacity, while enforcing a steady long-term rate. It is memory-efficient (requiring only a timestamp and token count per entity) and prevents the "thundering herd" problem seen in simple window counters.
                </EngineeringNote>
              </div>
            </div>
          </section>

          {/* Cache Demo */}
          <section id="cache" className="scroll-mt-24">
            <div className="font-mono text-sm text-accent mb-6 uppercase tracking-wider">// cache_strategy</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 surface p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Read-Through Caching</h3>
                  <button 
                    onClick={() => { cacheRef.current.invalidate(); setCacheLogs(prev => [...prev, { id: 'inv', time: new Date().toISOString().substring(11,19), type: 'info', message: 'Cache invalidated' }]); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors"
                  >
                    <RefreshCcw className="w-3 h-3" /> Invalidate All
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {["user:42", "post:9001", "feed:home"].map(key => (
                    <button
                      key={key}
                      onClick={() => handleFetchKey(key)}
                      disabled={isFetching}
                      className="px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded hover:bg-accent/20 transition-colors font-mono text-sm disabled:opacity-50"
                    >
                      GET {key}
                    </button>
                  ))}
                </div>

                <div className="h-32 bg-background/50 rounded-lg border border-border relative overflow-hidden flex flex-col justify-between p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-muted-foreground">Client</span>
                    
                    {/* Fast path / Cache */}
                    <div className="flex-1 mx-4 flex items-center gap-2">
                      <div className="h-px bg-border flex-1" />
                      <div className="bg-success/20 border border-success/40 text-success px-3 py-1 text-xs font-mono rounded flex items-center gap-1">
                        <Zap className="w-3 h-3" /> L1 Cache
                      </div>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    
                    <span className="font-mono text-xs text-muted-foreground">App Server</span>
                  </div>
                  
                  {/* Slow path / DB */}
                  <div className="flex justify-center items-center mt-auto">
                    <div className="bg-info/10 border border-info/30 text-info px-4 py-2 text-xs font-mono rounded flex items-center gap-2">
                      <Database className="w-4 h-4" /> Primary Database (~{highTraffic ? '700' : '350'}ms)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric label="Hits" value={cacheMetrics.hits} color="success" />
                  <Metric label="Misses" value={cacheMetrics.misses} color="warning" />
                  <Metric label="Avg Hit Lat" value={cacheMetrics.avgCacheLatency} unit="ms" color="success" />
                  <Metric label="Avg Miss Lat" value={cacheMetrics.avgDbLatency} unit="ms" color="warning" />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <LogPanel entries={cacheLogs} />
                <EngineeringNote title="Caching Layers">
                  Read-through caching reduces database load for read-heavy workloads. The application attempts to read from cache first (L1). On a miss, it fetches from the database, populates the cache with a TTL (Time-To-Live), and returns the data. Cache invalidation strategies are critical to avoid serving stale data.
                </EngineeringNote>
              </div>
            </div>
          </section>

          {/* Queue Demo */}
          <section id="queue" className="scroll-mt-24">
            <div className="font-mono text-sm text-info mb-6 uppercase tracking-wider">// async_queues</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 surface p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Background Job Processing</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setJobs([])}
                      className="px-3 py-1.5 rounded-md font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Purge
                    </button>
                    <button 
                      onClick={handleEnqueue}
                      className="px-3 py-1.5 rounded-md font-mono text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
                    >
                      + Enqueue
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 border border-border bg-secondary/30 rounded-lg">
                  <Cpu className={`w-6 h-6 ${workerActive ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold">Queue Worker Instance</div>
                    <div className="text-xs text-muted-foreground">Polling interval: 800ms</div>
                  </div>
                  <button 
                    onClick={() => setWorkerActive(!workerActive)}
                    className={`px-4 py-2 rounded font-mono text-sm transition-colors ${workerActive ? 'bg-success/20 text-success border border-success/40' : 'bg-secondary text-foreground border border-border'}`}
                  >
                    {workerActive ? 'Worker Active' : 'Start Worker'}
                  </button>
                </div>

                <div className="space-y-2 h-48 overflow-y-auto pr-2">
                  {jobs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm italic">Queue is empty</div>
                  ) : (
                    [...jobs].reverse().map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 border border-border rounded surface">
                        <div className="flex items-center gap-3">
                          {job.status === 'pending' && <span className="text-muted-foreground">⏳</span>}
                          {job.status === 'processing' && <span className="text-info animate-spin">⚙️</span>}
                          {job.status === 'completed' && <span className="text-success">✓</span>}
                          {job.status === 'failed' && <span className="text-destructive">✗</span>}
                          <span className="font-mono text-sm">{job.id}</span>
                          <span className="text-xs text-muted-foreground">{job.name}</span>
                        </div>
                        <span className={`text-xs font-mono uppercase ${
                          job.status === 'pending' ? 'text-muted-foreground' :
                          job.status === 'processing' ? 'text-info' :
                          job.status === 'completed' ? 'text-success' : 'text-destructive'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Metric label="Pending" value={jobs.filter(j => j.status === 'pending').length} />
                  <Metric label="Processing" value={jobs.filter(j => j.status === 'processing').length} color="info" />
                  <Metric label="Done" value={jobs.filter(j => j.status === 'completed').length} color="success" />
                  <Metric label="Failed" value={jobs.filter(j => j.status === 'failed').length} color="destructive" />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <LogPanel entries={queueLogs} />
                <EngineeringNote title="Event-Driven Workers">
                  Offloading heavy or slow tasks (like image resizing or sending emails) to a background queue ensures the main API responds quickly to the client. Workers process jobs asynchronously, providing retry mechanisms, exponential backoff, and isolation from the web tier.
                </EngineeringNote>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
