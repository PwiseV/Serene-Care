'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Header({ session }: { session: any }) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return pathname === path 
      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1 font-medium font-sans"
      : "text-slate-800 hover:text-indigo-500 transition-colors font-medium font-sans";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-[0px_12px_32px_rgba(27,28,28,0.08)]">
      <nav className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-indigo-600 font-heading">
            Serene Care
          </Link>
          <div className="hidden md:flex gap-8">
            <Link href="/" className={isActive('/')}>Trang chủ</Link>
            <Link href="/doctors" className={isActive('/doctors')}>Bác sĩ</Link>
            <Link href="/about" className={isActive('/about')}>Giới thiệu</Link>
            <Link href="/contact" className={isActive('/contact')}>Liên hệ</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <img 
                  alt="User profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQfXsofMFv4ah0bgfIFXXAbXqN_yoqL3Et7knnvF-6ch5bPGcom1cwpurQvnX3zIgSzUgDrn1Kki_-T7SiY7ptDcZpT_UJPlITyjtNO4yNw1C_TS3jsdWn36uVUAVHc-uau5wK-DnjDElfADvQ3GJuWOxy3S7ZwCMymsONV19lGvUk6HQC_-FOsrkLw_AQwmDF86mUyuZjzsnRj4QHPBZKbX9JNl-wwjtfO19EmO8Z5u9PYtjqh3uvA6RQa4wFXKcBAnN_nckvmaw" 
                  className="w-full h-full object-cover"
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/50">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {session.user?.name || "Người dùng"}
                    </p>
                    <p className="text-xs font-medium text-on-surface-variant truncate mt-0.5">
                      {session.user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/dashboard/patient"
                      className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors font-medium flex items-center gap-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      Lịch khám của tôi
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors font-medium flex items-center gap-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                      Cài đặt tài khoản
                    </Link>
                  </div>
                  <div className="py-2 border-t border-outline-variant/20">
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/30 transition-colors font-medium flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2.5 text-indigo-600 font-semibold hover:bg-slate-100 transition-all rounded-full active:scale-95 font-sans">
                Đăng nhập
              </Link>
              <Link href="/register" className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 font-sans">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
