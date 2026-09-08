import PolicyLayout from '../../components/layout/PolicyLayout';

const Contact = () => {
  return (
    <PolicyLayout title="Liên hệ với chúng tôi">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] font-medium text-gray-400 mb-6">Thông tin công ty</h2>
            <div className="space-y-4 text-gray-800">
              <div className="flex flex-col">
                <span className="font-semibold text-xl mb-1">CÔNG TY TNHH THỜI TRANG SIXTHSOUL VN</span>
                <span className="text-gray-500 font-light leading-relaxed">
                  [Địa chỉ trụ sở sẽ được cập nhật sau]
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] font-medium text-gray-400 mb-6">Kết nối trực tiếp</h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Hotline / Zalo</span>
                <a href="tel:0379799998" className="text-2xl font-serif hover:text-gray-500 transition-colors">0379 799 998</a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Email</span>
                <a href="mailto:contact@sixthsoul.com" className="text-lg font-light hover:text-gray-500 transition-colors">[Email sẽ được cập nhật sau]</a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Website</span>
                <a href="https://www.sixthsoul.com" target="_blank" rel="noreferrer" className="text-lg font-light hover:text-gray-500 transition-colors">www.sixthsoul.com</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] font-medium text-gray-400 mb-6">Mạng xã hội</h2>
            <div className="flex gap-6 items-center">
              <a href="#" className="text-sm font-medium hover:underline">Facebook</a>
              <a href="#" className="text-sm font-medium hover:underline">Instagram</a>
              <a href="#" className="text-sm font-medium hover:underline">TikTok Shop</a>
            </div>
          </section>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100">
          <h2 className="text-xl font-serif font-medium mb-8">Gửi tin nhắn cho SixthSoul</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Họ tên</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Nàng tên là..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Số điện thoại</label>
                <input type="tel" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Để shop tiện gọi nha" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Email</label>
              <input type="email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Để nhận phản hồi nè" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Nội dung nàng cần hỗ trợ</label>
              <textarea rows={4} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none" placeholder="SixthSoul đang lắng nghe nàng đây..."></textarea>
            </div>
            <button type="submit" className="w-full bg-black text-white rounded-xl py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-black/5">
              Gửi yêu cầu
            </button>
          </form>
        </div>
      </div>
    </PolicyLayout>
  );
};

export default Contact;
