export default function ContactPage() {
    return (
      <main className="pt-32 pb-24 min-h-screen bg-surface">
        <section className="max-w-4xl mx-auto px-8 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>
          
          <div className="relative z-10 text-center mb-16">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-2 block">HỖ TRỢ TRỰC TUYẾN</span>
            <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-heading">
              Chúng tôi có thể giúp gì?
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Đội ngũ chăm sóc khách hàng của Serene Care luôn sẵn sàng giải đáp và hỗ trợ bạn 24/7.
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {/* Info Options */}
              <div className="flex flex-col gap-6">
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg shadow-indigo-500/5 group hover:bg-primary transition-colors cursor-pointer border border-outline-variant/30">
                   <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:text-white transition-colors">call</span>
                   <h3 className="text-xl font-bold font-heading text-on-surface group-hover:text-white transition-colors">Hotline Khẩn Cấp</h3>
                   <p className="text-on-surface-variant mb-4 group-hover:text-white/80 transition-colors">Dành cho các trường hợp y tế khẩn cấp cần đặt lịch gấp.</p>
                   <p className="text-2xl font-bold text-primary group-hover:text-white transition-colors">1900 6868</p>
                </div>
                
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg shadow-indigo-500/5 hover:-translate-y-1 transition-transform border border-outline-variant/30">
                   <span className="material-symbols-outlined text-4xl text-primary mb-4">location_on</span>
                   <h3 className="text-xl font-bold font-heading text-on-surface mb-2">Trụ sở chính</h3>
                   <p className="text-on-surface-variant">
                     Tòa nhà The Ethereal Clinic, <br />
                     Số 123 Đường Nam Kỳ Khởi Nghĩa, <br />
                     Biên Hòa, Đồng Nai.
                   </p>
                </div>
              </div>
  
              {/* Contact Form */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-outline-variant/20">
                  <h3 className="text-2xl font-bold font-heading text-on-surface mb-6">Gửi tin nhắn cho chúng tôi</h3>
                  <form className="flex flex-col gap-5">
                      <div>
                          <label className="block text-sm font-bold text-on-surface-variant mb-2 font-sans">Họ và Tên</label>
                          <input type="text" className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Nhập tên của bạn" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-on-surface-variant mb-2 font-sans">Email</label>
                          <input type="email" className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="name@example.com" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-on-surface-variant mb-2 font-sans">Nội dung</label>
                          <textarea rows={4} className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" placeholder="Bạn cần hỗ trợ vấn đề gì?"></textarea>
                      </div>
                      <button type="button" className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-xl mt-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                          Gửi yêu cầu
                      </button>
                  </form>
              </div>
          </div>
        </section>
      </main>
    );
  }
