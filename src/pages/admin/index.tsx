import { useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAdmin, authReady } = useApp();

  useEffect(() => {
    if (!authReady) return;

    if (isAdmin) {
      setLocation("/");
    } else {
      setLocation("/admin/login");
    }
  }, [authReady, isAdmin, setLocation]);

  return null;
}
