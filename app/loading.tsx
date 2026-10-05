import { Logo } from '@/components/Logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <Logo size={48} />
        <div className="w-48 h-1 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-900 rounded-full" style={{
            animation: 'loading 1.5s ease-in-out infinite'
          }} />
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% {
            width: 0%;
            transform: translateX(-100%);
          }
          50% {
            width: 100%;
            transform: translateX(0%);
          }
          100% {
            width: 0%;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
