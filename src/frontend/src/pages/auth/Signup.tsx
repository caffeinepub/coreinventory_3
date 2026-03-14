import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getCredentials, saveCredential } from "../../store/authStore";
import type { AuthUser } from "../../types/inventory";

interface SignupProps {
  onSignup: (user: AuthUser) => void;
  onGoLogin: () => void;
}

const BENEFITS = [
  "Unlimited product tracking",
  "Multi-warehouse support",
  "Full movement audit trail",
];

export default function Signup({ onSignup, onGoLogin }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const existing = getCredentials()[email.toLowerCase()];
    if (existing) {
      toast.error("An account with this email already exists. Please sign in.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      saveCredential(email, { name, password });
      const user: AuthUser = { id: `user-${email.split("@")[0]}`, name, email };
      toast.success("Account created! Welcome to StockFlow.");
      onSignup(user);
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.14 0.06 274) 0%, oklch(0.11 0.04 264) 50%, oklch(0.10 0.04 258) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-[5%] left-[-5%] w-[450px] h-[450px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.45 0.20 274 / 0.16) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.35 0.18 264 / 0.14) 0%, transparent 70%)",
            }}
          />
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dots-signup"
                x="0"
                y="0"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-signup)" />
          </svg>
        </div>

        <div className="relative z-10">
          <img
            src="/assets/generated/stockflow-logo-transparent.dim_400x100.png"
            alt="StockFlow"
            className="h-32 w-auto object-contain"
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <h2
            className="font-display font-bold leading-[1.15] mb-4"
            style={{
              fontSize: "clamp(2rem, 3vw, 2.75rem)",
              color: "oklch(0.96 0.008 264)",
            }}
          >
            Start managing
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.68 0.18 155), oklch(0.72 0.18 160))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              smarter.
            </span>
          </h2>
          <p
            className="text-base mb-10 max-w-sm leading-relaxed"
            style={{ color: "oklch(0.72 0.02 264)" }}
          >
            Join businesses that rely on StockFlow to keep their stock accurate
            and operations running smoothly.
          </p>
          <div className="space-y-4">
            {BENEFITS.map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.68 0.18 155 / 0.15)" }}
                >
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: "oklch(0.68 0.18 155)" }}
                  />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.82 0.015 264)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: "oklch(0.50 0.02 264)" }}>
            Free to get started · No credit card required
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
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Fill in the details below to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-ocid="signup.input"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-ocid="signup.email_input"
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
                data-ocid="signup.password_input"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm mt-1"
              disabled={loading}
              data-ocid="signup.submit_button"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onGoLogin}
              className="font-semibold text-foreground hover:underline"
              data-ocid="signup.login_link"
            >
              Sign in
            </button>
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
