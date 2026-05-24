import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Projects from "@/pages/projects";
import Certifications from "@/pages/certifications";
import About from "@/pages/about";
import Lab from "@/pages/lab";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/index";

import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { EntryGate } from "@/components/EntryGate";
import { AdminToolbar } from "@/components/AdminToolbar";
import { AppProvider } from "@/contexts/AppContext";

const queryClient = new QueryClient();

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");
  return (
    <div className="flex flex-col min-h-screen">
      <AdminToolbar />
      {!isAdminRoute && <SiteNav />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <SiteFooter />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/certifications" component={Certifications} />
      <Route path="/about" component={About} />
      <Route path="/lab" component={Lab} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <EntryGate />
            <LayoutInner>
              <Router />
            </LayoutInner>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AppProvider>
  );
}

export default App;
