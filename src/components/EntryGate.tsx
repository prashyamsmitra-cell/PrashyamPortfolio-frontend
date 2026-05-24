import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { submitRecruiterVisit } from "@/lib/api";

type GateStatus = "idle" | "submitting" | "success" | "error";

export function EntryGate() {
  const [location, setLocation] = useLocation();
  const { isAdmin, authReady } = useApp();
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<GateStatus>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    companyName: "",
    reasonForVisit: "",
  });
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authReady) return;

    const isEntered = sessionStorage.getItem("portfolio.entered");

    if (isAdmin || location.startsWith("/admin")) {
      setShow(false);
      return;
    }

    if (!isEntered) {
      setShow(true);
      setTimeout(() => emailRef.current?.focus(), 300);
    } else {
      setShow(false);
    }
  }, [authReady, isAdmin, location]);

  const handleDismiss = () => {
    sessionStorage.setItem("portfolio.entered", "true");
    setShow(false);
  };

  const handleAdminAccess = () => {
    setShow(false);
    setLocation("/admin/login");
  };

  const updateField = (field: "email" | "companyName" | "reasonForVisit", value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      await submitRecruiterVisit(form);
      setStatus("success");
      setTimeout(handleDismiss, 900);
    } catch (submissionError) {
      setStatus("error");
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to register your visit right now.",
      );
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
        >
          <div className="w-full max-w-3xl">
            <div className="surface rounded-lg glow p-6 font-mono text-sm md:text-base text-primary/80">
              <div className="mb-5 space-y-1 text-muted-foreground">
                <p>Initializing recruiter access...</p>
                <p>Secure visitor intake channel... OK</p>
                <p>Share your details so I can tailor the conversation and follow up thoughtfully.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Work email
                    </span>
                    <input
                      ref={emailRef}
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      required
                      disabled={status === "submitting"}
                      className="w-full rounded border border-border bg-background/60 px-3 py-2 text-foreground outline-none transition-colors focus:border-primary"
                      data-testid="input-recruiter-email"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Company
                    </span>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(event) => updateField("companyName", event.target.value)}
                      required
                      disabled={status === "submitting"}
                      className="w-full rounded border border-border bg-background/60 px-3 py-2 text-foreground outline-none transition-colors focus:border-primary"
                      data-testid="input-recruiter-company"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Reason for visit
                  </span>
                  <textarea
                    value={form.reasonForVisit}
                    onChange={(event) => updateField("reasonForVisit", event.target.value)}
                    required
                    rows={4}
                    disabled={status === "submitting"}
                    className="w-full rounded border border-border bg-background/60 px-3 py-2 text-foreground outline-none transition-colors focus:border-primary resize-none"
                    data-testid="input-recruiter-reason"
                  />
                </label>

                <div className="flex flex-col gap-3 border-t border-border/50 pt-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-xs text-muted-foreground">
                    <p>Share details if you'd like me to follow up with context.</p>
                    <p>You can also skip and explore the portfolio right away.</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="rounded border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                      data-testid="button-skip-details"
                    >
                      Skip for now
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminAccess}
                      className="rounded border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      data-testid="button-admin-access"
                    >
                      Admin access
                    </button>
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-opacity disabled:opacity-70"
                      data-testid="button-enter-portfolio"
                    >
                    {status === "submitting" ? "Saving visit..." : "Enter portfolio"}
                    </button>
                  </div>
                </div>

                {status === "success" && (
                  <div className="rounded border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                    Visit saved. Welcome in.
                  </div>
                )}

                {status === "error" && (
                  <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
