export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-8 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="h-7 w-56 bg-zinc-800 rounded-lg" />
        <div className="h-4 w-80 bg-zinc-800/60 rounded-lg" />

        {/* Nav pills skeleton */}
        <div className="flex gap-2 mt-4">
          {[120, 90, 110, 80, 95].map((w, i) => (
            <div key={i} className="h-8 bg-zinc-800 rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* Card skeleton */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="h-5 w-40 bg-zinc-800 rounded-lg" />
          <div className="h-px bg-zinc-800" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-24 bg-zinc-800 rounded" />
              <div className="h-10 bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
