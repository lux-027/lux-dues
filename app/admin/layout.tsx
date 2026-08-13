import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add authentication check here
  // For now, we'll allow access for development
  
  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin">
                <Logo size={44} />
              </Link>
              <div className="flex items-center gap-4">
                <Link 
                  href="/admin/buildings" 
                  className="nav-link"
                >
                  Binalar
                </Link>
                <Link 
                  href="/admin/admins" 
                  className="nav-link"
                >
                  Yöneticiler
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">Admin User</span>
              <button className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
