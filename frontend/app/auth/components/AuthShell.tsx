import Image from "next/image";
import Link from "next/link";
import { BarChart3, Check, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthShell({ children, mode }: { children: React.ReactNode; mode: "signin" | "signup" }) {
  const features = [
    { icon: BarChart3, label: "See the numbers that matter" },
    { icon: Check, label: "Set goals that fit your body" },
    { icon: ShieldCheck, label: "Secure, private account access" },
  ];

  return (
    <div className="auth-backdrop min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(22rem,0.9fr)_minmax(34rem,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-brand-active px-10 py-9 text-white lg:flex lg:min-h-screen lg:flex-col xl:px-16">
        <div className="absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-brand/40 blur-3xl" />
        <Link href="/" className="relative z-10 w-fit rounded-2xl bg-white px-4 py-2 shadow-lg shadow-black/10" aria-label="Lose To Gain home">
          <Image src="/logo.png" alt="Lose To Gain" width={124} height={54} priority />
        </Link>
        <div className="relative z-10 my-auto max-w-lg py-14">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/90 backdrop-blur">
            <Sparkles size={15} /> Built around your goals
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Small choices. Clear progress. A healthier you.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/75">Plan meals, understand your nutrition, and build habits that last—with your daily targets in one calm place.</p>
          <div className="mt-10 grid gap-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm font-semibold text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Icon size={18} /></span>
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/55">© {new Date().getFullYear()} Lose To Gain. Your progress, your pace.</p>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-9 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="Lose To Gain home"><Image src="/logo.png" alt="Lose To Gain" width={104} height={45} priority /></Link>
          <p className="text-sm text-muted">
            {mode === "signin" ? "New here?" : "Already a member?"}{" "}
            <Link href={mode === "signin" ? "/auth/signup" : "/auth/signin"} className="font-bold text-brand hover:text-brand-hover">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </section>
    </div>
  );
}
