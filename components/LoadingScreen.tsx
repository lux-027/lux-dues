export function LoadingScreen({ label = 'Yükleniyor' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center gap-6">
      <img src="/logo-white.png" alt="LuxDues" className="h-16 sm:h-20 w-auto object-contain" />
      <div className="flex flex-col items-center gap-3">
        <span className="text-zinc-900 text-sm font-semibold tracking-[0.25em] uppercase">LuxDues</span>
        <div className="w-40 h-0.5 bg-zinc-200 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-900 rounded-full animate-[loadbar_1.4s_ease-in-out_infinite]" />
        </div>
        <span className="text-zinc-500 text-xs">{label}...</span>
      </div>
      <style>{`@keyframes loadbar { 0% { width: 0%; } 60% { width: 85%; } 100% { width: 100%; } }`}</style>
    </div>
  );
}
