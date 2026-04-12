'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path 
      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1 font-medium font-sans"
      : "text-slate-600 hover:text-indigo-500 transition-colors font-medium font-sans";
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0px_12px_32px_rgba(27,28,28,0.06)]">
      <nav className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-indigo-600 font-heading">
          Serene Care
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={isActive('/')}>Trang chủ</Link>
          <Link href="/doctors" className={isActive('/doctors')}>Bác sĩ</Link>
          <Link href="/about" className={isActive('/about')}>Giới thiệu</Link>
          <Link href="/contact" className={isActive('/contact')}>Liên hệ</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-2.5 text-indigo-600 font-semibold hover:bg-slate-100 transition-all rounded-full active:scale-95 font-sans">
            Đăng nhập
          </Link>
          <Link href="/register" className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 font-sans">
            Đăng ký
          </Link>
        </div>
      </nav>
    </header>
  );
}
