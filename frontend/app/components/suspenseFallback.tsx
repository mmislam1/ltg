type SuspenseFallbackProps = {
  className?: string;
  label?: string;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-brand-soft ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageSuspenseFallback({
  className = "",
  label = "Loading page",
}: SuspenseFallbackProps) {
  return (
    <section
      className={`mx-auto grid min-h-[60vh] w-full max-w-6xl gap-4 px-3 py-6 sm:px-6 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="grid gap-2">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-8 w-56 max-w-full" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <SkeletonBlock className="min-h-72" />
      <span className="sr-only">{label}</span>
    </section>
  );
}

export function AuthSuspenseFallback({
  label = "Loading authentication form",
}: SuspenseFallbackProps) {
  return (
    <main
      className="auth-backdrop flex min-h-screen w-full items-center justify-center px-4 py-8"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="grid w-full max-w-md gap-5">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-10 w-72 max-w-full" />
        <div className="grid gap-4">
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </main>
  );
}

export function ComponentSuspenseFallback({
  className = "",
  label = "Loading section",
}: SuspenseFallbackProps) {
  return (
    <div
      className={`card grid min-h-28 gap-3 p-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-12" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function NavigationSuspenseFallback({
  label = "Loading navigation",
}: SuspenseFallbackProps) {
  return (
    <div
      className="h-16 w-full border-b border-line bg-surface"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
