export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" />
        </div>
        <p className="text-xs text-zinc-500 font-medium tracking-wide animate-pulse">Đang tải...</p>
      </div>
    </div>
  );
}
