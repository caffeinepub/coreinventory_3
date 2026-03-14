import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  saveCredential,
  seedDemoAccount,
  validateCredential,
} from "../../store/authStore";
import type { AuthUser } from "../../types/inventory";

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

const FEATURES = [
  { icon: Zap, text: "Real-time inventory tracking" },
  { icon: Package, text: "Multi-warehouse management" },
  { icon: Sparkles, text: "Instant low-stock alerts" },
];

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedDemoAccount();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const existing = validateCredential(email, password);
    const allCreds = (() => {
      try {
        const raw = localStorage.getItem("ci_credentials");
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })();
    const hasEmail = !!allCreds[email.toLowerCase()];

    if (hasEmail && existing === null) {
      toast.error("Incorrect password. Please try again.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      let name: string;
      if (existing) {
        name = existing.name;
      } else {
        name = email.split("@")[0];
        saveCredential(email, { name, password });
      }

      const user: AuthUser = {
        id: `user-${email.split("@")[0]}`,
        name,
        email,
      };
      toast.success("Welcome back!");
      onLogin(user);
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.14 0.09 292) 0%, oklch(0.10 0.06 288) 55%, oklch(0.08 0.04 284) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none auth-pattern"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.52 0.28 290 / 0.22) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute bottom-[0%] left-[-10%] w-[450px] h-[450px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.18 195 / 0.15) 0%, transparent 65%)",
            }}
          />
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-[0.07]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dots-login"
                x="0"
                y="0"
                width="26"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-login)" />
          </svg>
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10">
          <img
            src="/assets/generated/stockflow-logo-transparent.dim_400x100.png"
            alt="StockFlow"
            className="h-32 w-auto object-contain"
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 w-fit"
            style={{
              background: "oklch(0.72 0.18 195 / 0.15)",
              color: "oklch(0.82 0.16 195)",
              border: "1px solid oklch(0.72 0.18 195 / 0.30)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            Inventory OS for modern teams
          </div>
          <h2
            className="font-display font-bold leading-[1.12] mb-5"
            style={{
              fontSize: "clamp(2rem, 3vw, 2.9rem)",
              color: "oklch(0.97 0.005 290)",
            }}
          >
            Stock under
            <br />
            <span className="gradient-text-cyan">perfect control.</span>
          </h2>
          <p
            className="text-base mb-10 max-w-sm leading-relaxed"
            style={{ color: "oklch(0.62 0.04 290)" }}
          >
            Track stock in real time, manage multiple warehouses, and eliminate
            manual errors — all from one dashboard.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.52 0.28 290 / 0.20)" }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "oklch(0.78 0.20 195)" }}
                  />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.80 0.02 290)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: "oklch(0.38 0.03 290)" }}>
            Trusted by operations teams worldwide
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background">
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <img
            src="/assets/generated/stockflow-logo-transparent.dim_400x100.png"
            alt="StockFlow"
            className="h-28 w-auto object-contain"
          />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-ocid="auth.input"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-ocid="auth.password_input"
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm"
              disabled={loading}
              data-ocid="auth.submit_button"
              style={{
                background: loading
                  ? undefined
                  : "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.25 300))",
                boxShadow: loading
                  ? undefined
                  : "0 4px 16px oklch(0.52 0.28 290 / 0.35)",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div
            className="mt-5 rounded-xl p-4 border"
            style={{
              background: "oklch(0.52 0.28 290 / 0.04)",
              borderColor: "oklch(0.52 0.28 290 / 0.18)",
            }}
          >
            <p className="text-xs font-semibold text-foreground mb-1">
              Demo credentials
            </p>
            <p className="text-xs text-muted-foreground">
              demo@coreinventory.com{" "}
              <span
                className="font-mono px-1.5 py-0.5 rounded text-foreground"
                style={{ background: "oklch(0.52 0.28 290 / 0.08)" }}
              >
                demo123
              </span>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="#/signup"
              className="font-semibold text-foreground hover:underline"
            >
              Sign up
            </a>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
