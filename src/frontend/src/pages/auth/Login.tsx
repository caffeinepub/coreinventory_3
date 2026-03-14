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

type FormMode = "login" | "forgot";

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const allCreds = (() => {
      try {
        const raw = localStorage.getItem("ci_credentials");
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })();
    const key = resetEmail.toLowerCase();
    if (!allCreds[key]) {
      toast.error("No account found with this email");
      return;
    }

    const existing = allCreds[key];
    saveCredential(resetEmail, { name: existing.name, password: newPassword });
    toast.success("Password reset successfully. Please sign in.");
    setMode("login");
    setEmail(resetEmail);
    setPassword("");
    setResetEmail("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const brandPanel = (
    <div
      className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.14 0.09 292) 0%, oklch(0.10 0.06 288) 55%, oklch(0.08 0.04 284) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
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
      </div>

      <div className="relative z-10">
        <img
          src="/assets/generated/stockflow-logo-transparent.dim_400x100.png"
          alt="StockFlow"
          className="h-44 w-auto object-contain"
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
  );

  return (
    <div className="min-h-screen flex">
      {brandPanel}

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background">
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <img
            src="/assets/generated/stockflow-logo-transparent.dim_400x100.png"
            alt="StockFlow"
            className="h-40 w-auto object-contain"
          />
        </div>

        <div className="w-full max-w-sm">
          {mode === "login" ? (
            <>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setResetEmail(email);
                      }}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "oklch(0.68 0.22 290)" }}
                      data-ocid="auth.forgot_password_link"
                    >
                      Forgot password?
                    </button>
                  </div>
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
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold font-display text-foreground">
                  Reset password
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your email and choose a new password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    data-ocid="forgot.email_input"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    data-ocid="forgot.new_password_input"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirm new password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-ocid="forgot.confirm_password_input"
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-semibold text-sm"
                  data-ocid="forgot.submit_button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.25 300))",
                    boxShadow: "0 4px 16px oklch(0.52 0.28 290 / 0.35)",
                  }}
                >
                  Reset password
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="font-semibold text-foreground hover:underline"
                  data-ocid="forgot.back_to_login_link"
                >
                  Back to sign in
                </button>
              </p>
            </>
          )}

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
