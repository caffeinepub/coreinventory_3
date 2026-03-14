import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { InventoryProvider } from "./store/inventoryStore";
import { NavContext } from "./store/navContext";
import type { AuthUser } from "./types/inventory";

import DashboardLayout from "./components/layout/DashboardLayout";
import Adjustments from "./pages/Adjustments";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Products from "./pages/Products";
import Receipts from "./pages/Receipts";
import StockHistory from "./pages/StockHistory";
import Transfers from "./pages/Transfers";
import Warehouses from "./pages/Warehouses";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

function getHashPath(): string {
  return window.location.hash.replace(/^#\/?/, "/") || "/";
}

function renderPage(path: string) {
  const base = path.split("?")[0];
  switch (base) {
    case "/dashboard":
      return <Dashboard />;
    case "/products":
      return <Products />;
    case "/receipts":
      return <Receipts />;
    case "/deliveries":
      return <Deliveries />;
    case "/transfers":
      return <Transfers />;
    case "/adjustments":
      return <Adjustments />;
    case "/stock-history":
      return <StockHistory />;
    case "/warehouses":
      return <Warehouses />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
  const [path, setPath] = useState<string>(() => getHashPath());
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem("ci_user");
      return s ? (JSON.parse(s) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const navigate = useCallback((to: string) => {
    window.location.hash = to.startsWith("/") ? to : `/${to}`;
  }, []);

  useEffect(() => {
    const handler = () => setPath(getHashPath());
    window.addEventListener("hashchange", handler);
    if (!window.location.hash || window.location.hash === "#") {
      window.location.hash = user ? "/dashboard" : "/login";
    }
    return () => window.removeEventListener("hashchange", handler);
  }, [user]);

  const handleLogin = (userData: AuthUser) => {
    localStorage.setItem("ci_user", JSON.stringify(userData));
    setUser(userData);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("ci_user");
    setUser(null);
    navigate("/login");
  };

  const isAuthPage = path === "/login" || path === "/signup";

  if (!user && !isAuthPage) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  if (isAuthPage) {
    return (
      <>
        {path === "/login" ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Signup onSignup={handleLogin} onGoLogin={() => navigate("/login")} />
        )}
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <InventoryProvider>
      <NavContext.Provider value={{ path, navigate }}>
        <DashboardLayout user={user!} onLogout={handleLogout} path={path}>
          {renderPage(path)}
        </DashboardLayout>
        <Toaster richColors position="top-right" />
      </NavContext.Provider>
    </InventoryProvider>
  );
}
