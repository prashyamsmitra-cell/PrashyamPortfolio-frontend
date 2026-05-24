import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAdminSession, getSiteContent, loginAdmin, logoutAdmin, saveSiteContent } from "@/lib/api";

export interface Project {
  id: string; name: string; position: number;
  problem: string; architecture: string[]; stack: string[];
  decisions: string[]; live_url: string | null; github_url: string | null;
}
export interface Certification {
  id: string; name: string; issuer: string; year: number;
  credential_url: string; position: number;
}
export interface Social {
  id: string; platform: string; url: string; position: number;
}
export interface HeroContent {
  heading: string; subheading: string; philosophy: string;
}
export interface AboutContent {
  bio: string[];
  philosophyItems: { color: string; title: string; body: string }[];
  skillGroups: { category: string; items: string[] }[];
}
export type ThemeName = "mint" | "cyber" | "nova" | "arctic" | "matrix";

export interface SiteData {
  theme: ThemeName;
  hero: HeroContent;
  projects: Project[];
  certifications: Certification[];
  socials: Social[];
  brandText: string;
  about: AboutContent;
  copyrightName: string;
}

const STORAGE_DATA_KEY = "portfolio_site_data";
const DEFAULT_GITHUB_URL = "https://github.com/prashyamsmitra-cell";

function normalizeExternalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === "#") {
    return null;
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function sanitizeProject(project: Project): Project {
  return {
    ...project,
    github_url: normalizeExternalUrl(project.github_url) ?? "",
    live_url: normalizeExternalUrl(project.live_url),
  };
}

function sanitizeCertification(certification: Certification): Certification {
  return {
    ...certification,
    credential_url: normalizeExternalUrl(certification.credential_url) ?? "",
  };
}

function sanitizeSocial(social: Social): Social {
  const fallbackUrl =
    social.platform === "GitHub"
      ? DEFAULT_GITHUB_URL
      : null;

  return {
    ...social,
    url: normalizeExternalUrl(social.url) ?? fallbackUrl ?? "",
  };
}

function sanitizeSiteData(data: SiteData): SiteData {
  return {
    ...data,
    projects: data.projects.map(sanitizeProject),
    certifications: data.certifications.map(sanitizeCertification),
    socials: data.socials.map(sanitizeSocial),
  };
}

const DEFAULT_DATA: SiteData = {
  theme: "mint",
  brandText: "eng@portfolio:~$",
  copyrightName: "Systems Engineer",
  hero: {
    heading: "I design and build real-world scalable systems, not just UI applications.",
    subheading:
      "Backend systems engineer specializing in distributed architecture, high-throughput APIs, and infrastructure automation.",
    philosophy: "Build for failure. Measure everything. Optimize last.",
  },
  about: {
    bio: [
      "I'm a Senior Backend Systems Engineer with a deep focus on designing and operating robust, high-performance distributed systems. While others argue over UI frameworks, I'm analyzing query plans, tuning indexes, and configuring load balancers to ensure the application stays up when the traffic spikes.",
      "My career has been defined by solving hard technical problems at scale. Whether it's building a rate-limiter that can handle 10k requests per second, designing an event-sourced architecture for healthcare data, or optimizing an AI vector search pipeline to run in milliseconds, I thrive where complexity meets execution.",
    ],
    philosophyItems: [
      {
        color: "primary",
        title: "Build for Failure",
        body: "Networks drop. Disks fill up. Third-party APIs go down. I design systems that degrade gracefully rather than failing catastrophically. Circuit breakers, retries with exponential backoff, and robust dead-letter queues are defaults, not afterthoughts.",
      },
      {
        color: "accent",
        title: "Measure Everything",
        body: "You can't fix what you can't see. Comprehensive telemetry, structured logging, and APM tracing form the bedrock of any system I touch. If a service doesn't emit metrics, it doesn't go to production.",
      },
      {
        color: "success",
        title: "Boring is Beautiful",
        body: "I prefer proven, robust technologies over the latest hype cycle. I choose PostgreSQL over niche NoSQL databases unless there is a strict operational requirement. Innovation should happen in the product, not the underlying infrastructure.",
      },
    ],
    skillGroups: [
      { category: "Languages", items: ["TypeScript", "Python", "Go", "Rust"] },
      { category: "Databases", items: ["PostgreSQL", "Redis", "MongoDB", "pgvector"] },
      { category: "Infrastructure", items: ["Kubernetes", "Docker", "Terraform", "AWS", "GCP"] },
      { category: "Async Systems", items: ["Bull", "Celery", "RabbitMQ", "Kafka"] },
      { category: "Realtime", items: ["WebSockets", "Server-Sent Events", "Supabase Realtime"] },
      { category: "AI / ML", items: ["OpenAI API", "LangChain", "pgvector", "embeddings pipelines"] },
    ],
  },
  projects: [
    { id: "1", name: "CareSync", position: 1, problem: "Healthcare providers needed real-time patient data sync across clinics with zero downtime.", architecture: ["Event-driven microservices", "PostgreSQL with CQRS", "Redis pub/sub for real-time", "Kubernetes deployment"], stack: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Kubernetes", "gRPC"], decisions: ["Chose event sourcing for audit trail compliance", "Used saga pattern for distributed transactions", "Implemented circuit breakers for clinic connectivity"], live_url: null, github_url: "#" },
    { id: "2", name: "VMS (Vendor Management System)", position: 2, problem: "Enterprise needed automated vendor onboarding with multi-stage approval workflows and SLA tracking.", architecture: ["Monolithic with modular boundaries", "Bull queue for async workflows", "PostgreSQL row-level security", "REST + WebSocket hybrid"], stack: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Bull", "WebSockets"], decisions: ["Kept monolith for team velocity", "Implemented finite state machine for approval stages", "Used materialized views for SLA dashboard"], live_url: null, github_url: "#" },
    { id: "3", name: "CV Analyzer", position: 3, problem: "HR teams spending 6+ hours manually screening hundreds of CVs per job posting.", architecture: ["FastAPI backend", "Async PDF extraction pipeline", "OpenAI embeddings for semantic matching", "PostgreSQL pgvector"], stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "OpenAI", "Celery", "Redis"], decisions: ["Chose pgvector over Pinecone to keep infra simple", "Used semantic chunking for better extraction", "Implemented streaming responses for real-time feedback"], live_url: null, github_url: "#" },
    { id: "4", name: "URL Shortener at Scale", position: 4, problem: "Build a URL shortener handling 10k+ RPS with sub-10ms redirect latency.", architecture: ["Distributed ID generation (Snowflake)", "Multi-tier caching (L1 in-process, L2 Redis)", "Read replicas for analytics", "CDN edge caching"], stack: ["Go", "Redis", "PostgreSQL", "Nginx", "Prometheus", "Grafana"], decisions: ["Used base62 encoding for short URLs", "Implemented bloom filter to avoid DB lookups for non-existent keys", "Separated read/write paths from day one"], live_url: null, github_url: "#" },
    { id: "5", name: "Review App Platform", position: 5, problem: "Dev teams needed isolated preview environments per PR without manual DevOps overhead.", architecture: ["GitHub webhooks trigger provisioning", "Docker + Kubernetes namespaces per PR", "Nginx ingress with dynamic subdomains", "Cleanup via TTL + webhook events"], stack: ["Node.js", "TypeScript", "Kubernetes", "Docker", "Nginx", "GitHub Actions"], decisions: ["Used namespace isolation over separate clusters for cost", "Implemented resource quotas to prevent runaway costs", "Chose Helm for templating over raw manifests"], live_url: null, github_url: "#" },
  ],
  certifications: [
    { id: "1", name: "AWS Solutions Architect - Associate", issuer: "Amazon Web Services", year: 2023, credential_url: "#", position: 1 },
    { id: "2", name: "Certified Kubernetes Administrator (CKA)", issuer: "CNCF", year: 2023, credential_url: "#", position: 2 },
    { id: "3", name: "HashiCorp Terraform Associate", issuer: "HashiCorp", year: 2024, credential_url: "#", position: 3 },
    { id: "4", name: "Google Cloud Professional Data Engineer", issuer: "Google Cloud", year: 2024, credential_url: "#", position: 4 },
  ],
  socials: [
    { id: "1", platform: "GitHub", url: DEFAULT_GITHUB_URL, position: 1 },
    { id: "2", platform: "LinkedIn", url: "", position: 2 },
  ],
};

export type ThemeDef = {
  label: string;
  dot: string;
  vars: Record<string, string>;
};

export const THEMES: Record<ThemeName, ThemeDef> = {
  mint: {
    label: "Mint", dot: "#5eead4",
    vars: {
      "--background": "oklch(0.16 0.018 260)", "--foreground": "oklch(0.96 0.01 240)",
      "--primary": "oklch(0.78 0.18 165)", "--accent": "oklch(0.72 0.18 250)",
      "--secondary": "oklch(0.26 0.025 260)", "--muted-foreground": "oklch(0.66 0.02 250)",
      "--border": "oklch(0.30 0.02 260 / 0.6)", "--success": "oklch(0.78 0.18 155)",
      "--destructive": "oklch(0.66 0.22 25)", "--warning": "oklch(0.82 0.16 85)",
      "--info": "oklch(0.72 0.16 235)",
    },
  },
  cyber: {
    label: "Cyber", dot: "#fbbf24",
    vars: {
      "--background": "oklch(0.13 0.028 40)", "--foreground": "oklch(0.96 0.015 60)",
      "--primary": "oklch(0.84 0.20 60)", "--accent": "oklch(0.75 0.22 30)",
      "--secondary": "oklch(0.24 0.040 40)", "--muted-foreground": "oklch(0.65 0.03 55)",
      "--border": "oklch(0.32 0.04 45 / 0.6)", "--success": "oklch(0.78 0.18 155)",
      "--destructive": "oklch(0.66 0.22 25)", "--warning": "oklch(0.86 0.18 75)",
      "--info": "oklch(0.72 0.16 235)",
    },
  },
  nova: {
    label: "Nova", dot: "#c084fc",
    vars: {
      "--background": "oklch(0.13 0.030 300)", "--foreground": "oklch(0.96 0.010 280)",
      "--primary": "oklch(0.76 0.22 315)", "--accent": "oklch(0.72 0.20 270)",
      "--secondary": "oklch(0.24 0.040 300)", "--muted-foreground": "oklch(0.65 0.02 290)",
      "--border": "oklch(0.30 0.04 300 / 0.6)", "--success": "oklch(0.78 0.18 155)",
      "--destructive": "oklch(0.66 0.22 25)", "--warning": "oklch(0.82 0.16 85)",
      "--info": "oklch(0.72 0.16 235)",
    },
  },
  arctic: {
    label: "Arctic", dot: "#38bdf8",
    vars: {
      "--background": "oklch(0.13 0.022 240)", "--foreground": "oklch(0.95 0.012 220)",
      "--primary": "oklch(0.80 0.14 220)", "--accent": "oklch(0.74 0.16 200)",
      "--secondary": "oklch(0.23 0.030 240)", "--muted-foreground": "oklch(0.64 0.02 230)",
      "--border": "oklch(0.30 0.025 240 / 0.6)", "--success": "oklch(0.78 0.18 155)",
      "--destructive": "oklch(0.66 0.22 25)", "--warning": "oklch(0.82 0.16 85)",
      "--info": "oklch(0.72 0.16 235)",
    },
  },
  matrix: {
    label: "Matrix", dot: "#4ade80",
    vars: {
      "--background": "oklch(0.10 0.012 160)", "--foreground": "oklch(0.90 0.02 150)",
      "--primary": "oklch(0.72 0.25 142)", "--accent": "oklch(0.62 0.18 160)",
      "--secondary": "oklch(0.20 0.025 155)", "--muted-foreground": "oklch(0.58 0.03 150)",
      "--border": "oklch(0.28 0.04 155 / 0.6)", "--success": "oklch(0.78 0.18 155)",
      "--destructive": "oklch(0.66 0.22 25)", "--warning": "oklch(0.82 0.16 85)",
      "--info": "oklch(0.72 0.16 235)",
    },
  },
};

function applyThemeToDOM(name: ThemeName) {
  const vars = THEMES[name].vars;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}

interface AppContextValue {
  data: SiteData;
  updateData: (updater: (prev: SiteData) => SiteData) => void;
  setTheme: (name: ThemeName) => void;
  isAdmin: boolean;
  authReady: boolean;
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  login: (adminId: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_DATA_KEY);
      if (stored) {
        return sanitizeSiteData({ ...DEFAULT_DATA, ...JSON.parse(stored) });
      }
    } catch {
      return sanitizeSiteData(DEFAULT_DATA);
    }
    return sanitizeSiteData(DEFAULT_DATA);
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    applyThemeToDOM(data.theme);
  }, [data.theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    let isActive = true;

    getSiteContent()
      .then((payload) => {
        if (!isActive || !payload.data) {
          return;
        }

        setData((prev) =>
          sanitizeSiteData({
            ...prev,
            ...(payload.data as Partial<SiteData>),
          }),
        );
      })
      .catch(() => {
        // Keep the locally cached/default content when the backend content endpoint is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_DATA_KEY || !event.newValue) {
        return;
      }

      try {
        setData(sanitizeSiteData({ ...DEFAULT_DATA, ...JSON.parse(event.newValue) }));
      } catch {
        // Ignore malformed storage updates and keep the current in-memory state.
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateData = useCallback((updater: (prev: SiteData) => SiteData) => {
    setData((prev) => {
      const next = sanitizeSiteData(updater(prev));

      if (isAdmin) {
        void saveSiteContent(next).catch(() => {
          // Keep the optimistic UI state even if persistence fails; a later save can retry.
        });
      }

      return next;
    });
  }, [isAdmin]);

  const setTheme = useCallback((name: ThemeName) => {
    setData((prev) => ({ ...prev, theme: name }));
  }, []);

  const refreshAdminSession = useCallback(async () => {
    try {
      const session = await getAdminSession();
      setIsAdmin(session.authenticated);
      if (!session.authenticated) {
        setPreviewMode(false);
      }
    } catch {
      setIsAdmin(false);
      setPreviewMode(false);
    }
  }, []);

  useEffect(() => {
    refreshAdminSession().finally(() => setAuthReady(true));
  }, [refreshAdminSession]);

  const login = useCallback(async (adminId: string, password: string) => {
    try {
      const session = await loginAdmin({ adminId, password });
      setIsAdmin(session.authenticated);
      setPreviewMode(false);
      return { ok: true } as const;
    } catch (error) {
      setIsAdmin(false);
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Unable to authenticate.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setIsAdmin(false);
      setPreviewMode(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        data,
        updateData,
        setTheme,
        isAdmin,
        authReady,
        previewMode,
        setPreviewMode,
        login,
        logout,
        refreshAdminSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
