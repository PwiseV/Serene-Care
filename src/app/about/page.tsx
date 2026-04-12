/* eslint-disable @next/next/no-img-element */

export default function AboutPage() {
    return (
      <main className="pt-20 pb-24 min-h-screen">
        {/* Header Hero */}
        <section className="relative h-[40vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-80" 
              alt="Medical Team" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxM3wvQ3AXeNjr-mkMpq-mWQBw2yJU6Ht92KpG6oSJ7-QirmzOLx0N80kodTBVEcx43whAMXoqiAWQIlBH9NNeSDNbMdve80IWgFSrQItrcz9yVDVJT0SvGAYY4epxmIlMSuNqJvJ6qMwIz2VbD-nnJKuAjC8BKkzEYNGzbZZyjLgRLsSQyboClI3m_A8jffyHWXKQIITppk6O9LwEOLDZQb_1P5zgueGBnBQGBVirZ8Qdw5ZM4AqvWxDp6rJCyhUDCszKLORpUPo"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/40"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <h1 className="text-6xl font-extrabold tracking-tight text-on-surface mb-4 font-heading">
              Câu chuyện của chúng tôi
            </h1>
            <p className="text-xl text-on-surface-variant font-medium max-w-2xl">
              Vì sao Serene Care ra đời và hành trình kiến tạo một môi trường y tế giảm thiểu căng thẳng cho mọi bệnh nhân.
            </p>
          </div>
        </section>
  
        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-8 mt-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">TẦM NHÌN & SỨ MỆNH</span>
              <h2 className="text-4xl font-bold tracking-tight mb-6 font-heading">
                Mang sự tĩnh tại vào quy trình trị liệu
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6 font-sans text-lg">
                Chúng tôi tin rằng việc chăm sóc sức khoẻ không nên đi kèm với những nỗi lo âu vô hình. Bằng cách thiết kế lại toàn bộ quy trình từ khâu đặt lịch đến khám chữa bệnh, Serene Care mong muốn mỗi bệnh nhân đều cảm thấy được trân trọng và an tâm.
              </p>
              <p className="text-on-surface-variant leading-relaxed font-sans text-lg">
                Đội ngũ chuyên gia y tế của chúng tôi không chỉ là những bác sĩ giỏi nhất, mà còn là những người lắng nghe tuyệt vời nhất.
              </p>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-10 relative overflow-hidden shadow-2xl shadow-indigo-500/10 border border-outline-variant/20">
               <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
               <div className="relative z-10">
                   <h3 className="text-2xl font-bold text-on-surface mb-4 font-heading">Giá trị cốt lõi</h3>
                   <ul className="space-y-4">
                       <li className="flex items-start gap-3">
                           <span className="material-symbols-outlined text-primary mt-0.5">favorite</span>
                           <span><strong className="text-on-surface">Tận tâm:</strong> Luôn đặt lợi ích của bệnh nhân lên hàng đầu.</span>
                       </li>
                       <li className="flex items-start gap-3">
                           <span className="material-symbols-outlined text-primary mt-0.5">psychology</span>
                           <span><strong className="text-on-surface">Trí tuệ:</strong> Áp dụng công nghệ số hoá vào y khoa chuẩn xác.</span>
                       </li>
                       <li className="flex items-start gap-3">
                           <span className="material-symbols-outlined text-primary mt-0.5">spa</span>
                           <span><strong className="text-on-surface">Bình an:</strong> Không gian và dịch vụ thiết kế theo "Calm Tech".</span>
                       </li>
                   </ul>
               </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
