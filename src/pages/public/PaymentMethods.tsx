import PolicyLayout from '../../components/layout/PolicyLayout';

const PaymentMethods = () => {
  return (
    <PolicyLayout title="Phương thức thanh toán">
      <section className="space-y-10">
        <div>
          <p className="text-gray-600 mb-8">
            Để giúp nàng thuận tiện nhất trong việc mua sắm, SixthSoul hỗ trợ các hình thức thanh toán linh hoạt dưới đây:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bank Transfer */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Chuyển khoản ngân hàng
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-gray-400">Ngân hàng</span>
                <span className="font-medium">MB Bank (Ngân hàng Quân Đội)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-gray-400">Số tài khoản</span>
                <span className="text-xl font-mono font-bold text-blue-900 tracking-wider">7100066666</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-gray-400">Chủ tài khoản</span>
                <span className="font-semibold uppercase">CTY TNHH THOI TRANG SIXTHSOUL VN</span>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs leading-relaxed">
                <strong>Lưu ý:</strong> Khi chuyển khoản, nàng vui lòng ghi nội dung: <strong>[Mã đơn hàng] - [Số điện thoại]</strong> để chúng mình xác nhận nhanh nhất nhé.
              </div>
            </div>
          </div>

          {/* COD */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Thanh toán khi nhận hàng (COD)
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Nàng có thể kiểm tra sản phẩm và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được kiện hàng từ SixthSoul.</p>
              <p className="text-sm text-gray-500">Hình thức này áp dụng cho toàn bộ đơn hàng trên toàn quốc.</p>
            </div>
          </div>
        </div>

        {/* Note about Sàn TMĐT */}
        <div className="mt-12 p-8 bg-gray-50 rounded-3xl border border-gray-100">
          <h2 className="text-lg font-medium mb-4">Mua hành trên Shopee & TikTok Shop</h2>
          <p className="text-gray-600">
            Đối với các đơn hàng đặt trực tiếp trên các sàn thương mại điện tử, các phương thức thanh toán (Thẻ tín dụng, Ví điện tử, ShopeePay...) sẽ được thực hiện theo quy định và hỗ trợ của từng sàn.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};

export default PaymentMethods;
