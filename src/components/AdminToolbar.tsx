import { useLocation } from "wouter";
import { Eye, EyeOff, LogOut, Shield } from "lucide-react";
import { useApp, THEMES, ThemeName } from "@/contexts/AppContext";
import { motion } from "framer-motion";

export function AdminToolbar() {
  const { isAdmin, previewMode, setPreviewMode, logout, data, setTheme } = useApp();
  const [, setLocation] = useLocation();

  if (!isAdmin) return null;

  const themeNames = Object.keys(THEMES) as ThemeName[];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <motion.div
      initial={{ y: -48 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="sticky top-0 z-[100] w-full border-b"
      style={{
        background: "oklch(0.10 0.015 260 / 0.95)",
        borderColor: "oklch(0.78 0.18 165 / 0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-widest">
              Admin Mode
            </span>
          </div>
          <span className="text-border text-xs">|</span>
          <span className="text-xs font-mono text-muted-foreground hidden sm:block">
            Hover sections to edit
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-muted-foreground mr-1 hidden md:block">Theme:</span>
          {themeNames.map((name) => {
            const theme = THEMES[name];
            const active = data.theme === name;
            return (
              <button
                key={name}
                onClick={() => setTheme(name)}
                data-testid={`button-theme-${name}`}
                title={theme.label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  active
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: theme.dot }}
                />
                <span className="hidden sm:inline">{theme.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            data-testid="button-preview-toggle"
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono border transition-all ${
              previewMode
                ? "bg-accent/20 text-accent border-accent/50"
                : "text-muted-foreground hover:text-foreground border-border/50 hover:bg-secondary/60"
            }`}
          >
            {previewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{previewMode ? "Recruiter view" : "Preview"}</span>
          </button>

          <button
            onClick={handleLogout}
            data-testid="button-admin-logout"
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
