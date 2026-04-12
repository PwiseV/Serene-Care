import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 w-full rounded-t-[2rem]">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-lg font-bold text-indigo-600 mb-2 font-heading">Serene Care</div>
          <p className="text-sm font-medium font-sans text-slate-500">© 2026 Serene Care. Bản quyền đã được bảo hộ.</p>
        </div>
        <div className="flex gap-8">
          <Link className="text-sm font-medium font-sans text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity duration-200" href="#">Chính sách bảo mật</Link>
          <Link className="text-sm font-medium font-sans text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity duration-200" href="#">Điều khoản dịch vụ</Link>
          <Link className="text-sm font-medium font-sans text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity duration-200" href="#">Trung tâm hỗ trợ</Link>
          <Link className="text-sm font-medium font-sans text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity duration-200" href="#">Tuyển dụng</Link>
        </div>
        <div className="flex gap-4 mt-8 md:mt-0">
          <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">public</span>
          <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">chat</span>
          <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">mail</span>
        </div>
      </div>
    </footer>
  );
}
