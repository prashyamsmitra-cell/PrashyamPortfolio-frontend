import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, authReady, isAdmin } = useApp();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authReady && isAdmin) {
      setLocation("/");
    }
  }, [authReady, isAdmin, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login(adminId, password);

    if (result.ok) {
      setLocation("/");
    } else {
      setError(result.error);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface w-full max-w-sm p-8 rounded-xl glow"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-mono">System Access</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">Authenticate to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Admin ID</label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
              autoFocus
              data-testid="input-admin-id"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full bg-input border border-border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
              data-testid="input-password"
            />
          </div>

          {error && (
            <div className="text-destructive font-mono text-xs text-center py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-medium rounded py-2.5 transition-colors mt-4"
            data-testid="button-login"
          >
            {submitting ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <button
          onClick={() => setLocation("/")}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors py-2"
          data-testid="button-back-to-site"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to recruiter view
        </button>
      </motion.div>
    </div>
  );
}
