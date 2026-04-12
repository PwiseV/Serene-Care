/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function Home() {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[870px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-90" 
            alt="Modern serene clinic interior" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuccvRiJ3FUunJSXbieq0Oh2OWGKgSZhwpqF7u_zjYZruW0ybdrfjHBSQDMrQaLLdCRGtY7Bqe-KLWrTASCk27npMbhq8jKdz5ZzlrYOGIktrrvQflRcdNGCezPBSyiN3cGrxsL9wKtfAsaF7YUaei_nxHFEQ3gWgdYvO0vIpqoIHBZGsdLmAc7_wGAhRvJkdZwTMFQnJfKO75s4RDe5-r4KAqMgCWzALixAZevyns6g3MMc8EUG35Gl2zEbqoUjHeFzQDGs6-QUw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-6 font-heading">
              Hành trình Sức khỏe bắt đầu từ sự Tĩnh lặng
            </h1>
            <p className="text-xl text-on-surface-variant mb-10 leading-relaxed font-sans font-medium">
              Trải nghiệm dịch vụ y tế được định nghĩa lại qua lăng kính của sự bình yên. Kết nối với các chuyên gia hàng đầu trong không gian được thiết kế dành riêng cho bạn.
            </p>
            
            <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-[0px_12px_32px_rgba(27,28,28,0.06)] flex flex-col md:flex-row gap-2 max-w-xl">
              <div className="flex-1 flex items-center px-4 gap-3 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-outline">search</span>
                <input className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-4 text-on-surface font-sans" placeholder="Tìm kiếm bác sĩ, chuyên khoa..." type="text"/>
              </div>
              <button className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold transition-all active:scale-95 font-sans">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block font-sans">CHUYÊN KHOA</span>
              <h2 className="text-4xl font-bold tracking-tight font-heading">Tìm kiếm theo Chuyên Khoa</h2>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
            <div className="min-w-[280px] bg-surface-container-lowest p-8 rounded-lg group hover:bg-primary transition-all duration-500 cursor-pointer border border-outline-variant/20 hover:border-transparent">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">psychology</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-white font-heading">Thần kinh học</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 text-sm leading-relaxed font-sans">Chăm sóc chuyên sâu cho não bộ và hệ thần kinh trung ương.</p>
            </div>
            
            <div className="min-w-[280px] bg-primary p-8 rounded-lg shadow-xl shadow-primary/20 cursor-pointer transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white font-heading">Tim mạch</h3>
              <p className="text-white/80 text-sm leading-relaxed font-sans">Chẩn đoán chuyên sâu và chăm sóc sức khỏe tim mạch toàn diện.</p>
            </div>

            <div className="min-w-[280px] bg-surface-container-lowest p-8 rounded-lg group hover:bg-primary transition-all duration-500 cursor-pointer border border-outline-variant/20 hover:border-transparent">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">pediatrics</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-white font-heading">Nhi khoa</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 text-sm leading-relaxed font-sans">Môi trường thư giãn và chăm sóc tận tình cho trẻ nhỏ thiết yếu.</p>
            </div>

            <div className="min-w-[280px] bg-surface-container-lowest p-8 rounded-lg group hover:bg-primary transition-all duration-500 cursor-pointer border border-outline-variant/20 hover:border-transparent">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">visibility</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-white font-heading">Nhãn khoa</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 text-sm leading-relaxed font-sans">Chăm sóc thị lực hiện đại và các quy trình phẫu thuật tiên tiến.</p>
            </div>

            <div className="min-w-[280px] bg-surface-container-lowest p-8 rounded-lg group hover:bg-primary transition-all duration-500 cursor-pointer border border-outline-variant/20 hover:border-transparent">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">skeleton</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-white font-heading">Xương khớp</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 text-sm leading-relaxed font-sans">Phục hồi chức năng vận động với các giải pháp hiện đại nhất.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Specialists Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4 font-heading">Đội ngũ Chuyên gia Hàng đầu</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto font-medium font-sans">Đặt lịch khám cùng các chuyên gia y tế uy tín, được công nhận vì sự xuất sắc trong thực hành y khoa và tận tâm với bệnh nhân.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Doctor Card 1 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-indigo-500/5">
              <div className="h-64 overflow-hidden relative">
                <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="Doctor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxM3wvQ3AXeNjr-mkMpq-mWQBw2yJU6Ht92KpG6oSJ7-QirmzOLx0N80kodTBVEcx43whAMXoqiAWQIlBH9NNeSDNbMdve80IWgFSrQItrcz9yVDVJT0SvGAYY4epxmIlMSuNqJvJ6qMwIz2VbD-nnJKuAjC8BKkzEYNGzbZZyjLgRLsSQyboClI3m_A8jffyHWXKQIITppk6O9LwEOLDZQb_1P5zgueGBnBQGBVirZ8Qdw5ZM4AqvWxDp6rJCyhUDCszKLORpUPo"/>
                <div className="absolute top-4 right-4 bg-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-on-secondary-container" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="text-xs font-bold text-on-secondary-container">4.9</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                  <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-1 block font-sans">Khoa Tim Mạch</span>
                  <h3 className="text-xl font-bold text-on-surface font-heading">Bs. Nguyễn Văn Tâm</h3>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed font-sans">Chuyên gia thực hiện các quy trình nội soi tim mạch và phòng ngừa đột quỵ.</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-primary font-bold">1.200k<span className="text-on-surface-variant font-medium text-xs font-sans">/khám</span></div>
                  <button className="px-6 py-3 bg-surface-container-high hover:bg-primary hover:text-white rounded-full font-bold transition-all active:scale-95 font-sans">
                    Đặt khám ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Doctor Card 2 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-indigo-500/5">
              <div className="h-64 overflow-hidden relative">
                <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="Doctor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG44Hr-4XrbokPuRpD4kv9KWG-0bpd9sZsUDVKfglp4GvUDUKWSuxz62EGt6CSBm2v7sm1W1cIBezaklOMJQUIFiFFUqX9Qo21Ap5Skg9vl-pna8u0wns8vxyOyvqNaeJ3REGVbJRDCjIQv-K3qSFFLun9CwsGrtWs7E6lMjZYY6z0tJR88SydgSCHyAH-ABaD0NS9BzSyWmcY3Cmo2HUQrggiAsSQYVzs6FWNxHUmrPVaUl8dqCBGAuHa5EsUxxcAiYOZVEefzOo"/>
                <div className="absolute top-4 right-4 bg-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-on-secondary-container" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="text-xs font-bold text-on-secondary-container">5.0</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                  <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-1 block font-sans">Khoa Thần Kinh</span>
                  <h3 className="text-xl font-bold text-on-surface font-heading">Bs. Trần Ngọc Diệp</h3>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed font-sans">Nổi tiếng với các nghiên cứu về hệ thần kinh và sự thấu cảm đặc biệt dành cho bệnh nhân.</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-primary font-bold">1.500k<span className="text-on-surface-variant font-medium text-xs font-sans">/khám</span></div>
                  <button className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 font-sans">
                    Đặt khám ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Doctor Card 3 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-indigo-500/5">
              <div className="h-64 overflow-hidden relative">
                <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="Doctor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLYOA7pdu5SZxnIxA3ptWv-uKBhR3r2z2ZuOrL1W_qGcZ2dvizAn_mQlhDtndaeUrUlsjWh-cqBSxIrAfQAR_8RRrVuHd6DnZBI5k8DNv32AZBQmEo5jXuzZa0N_apLR-SIMzZVBgMVQ3w1PNM4v_E8PpVLR8etOvi6J9Fuv0rlc3MP_ql3L8WmtasYDlE6leDqTGRZn0sDyIhIlkPnqUgB6B5PkKFnbmey_QDDYDkQwb6JUBD9eyEWedVnTenvkuWsJOXN26DxDY"/>
                <div className="absolute top-4 right-4 bg-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-on-secondary-container" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="text-xs font-bold text-on-secondary-container">4.8</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                  <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-1 block font-sans">Khoa Nhi</span>
                  <h3 className="text-xl font-bold text-on-surface font-heading">Bs. Lê Minh Khang</h3>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed font-sans">Hơn 15 năm kinh nghiệm về phát triển ở trẻ và điều trị dự phòng các bệnh mãn tính.</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-primary font-bold">1.100k<span className="text-on-surface-variant font-medium text-xs font-sans">/khám</span></div>
                  <button className="px-6 py-3 bg-surface-container-high hover:bg-primary hover:text-white rounded-full font-bold transition-all active:scale-95 font-sans">
                    Đặt khám ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto rounded-3xl bg-primary-container p-16 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight font-heading">Bạn đã sẵn sàng ưu tiên sức khỏe?</h2>
              <p className="text-white/80 text-xl font-medium font-sans">Tham gia cùng hơn 50.000 bệnh nhân đã tìm thấy sự yên tâm và minh mẫn cùng Serene Care.</p>
            </div>
            <div className="flex gap-4">
              <button className="bg-white text-primary px-10 py-5 rounded-full font-extrabold text-lg shadow-2xl transition-all active:scale-95 font-sans">Tìm Bác Sĩ Của Bạn</button>
              <button className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-full font-extrabold text-lg transition-all hover:bg-white/20 font-sans">Tìm Hiểu Thêm</button>
            </div>
          </div>
          
          {/* Abstract Design Elements */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-24 -top-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>
    </main>
  );
}
