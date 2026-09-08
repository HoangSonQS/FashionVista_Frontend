import PolicyLayout from '../../components/layout/PolicyLayout';

const ShippingPolicy = () => {
  return (
    <PolicyLayout title="Chính sách vận chuyển">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4">1. Đơn vị vận chuyển đối tác</h2>
          <p>Để đảm bảo hàng được giao đến nàng nhanh và an toàn nhất, SixthSoul hiện đang hợp tác với các đơn vị vận chuyển uy tín:</p>
          <ul className="list-disc list-inside ml-4 mt-3 space-y-2 text-gray-700">
            <li>Giao Hàng Nhanh (GHN)</li>
            <li>Giao Hàng Tiết Kiệm (GHTK)</li>
            <li>J&T Express</li>
            <li>Shopee Express (Áp dụng cho đơn hàng trên Shopee)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4">2. Thời gian xử lý và giao hàng</h2>
          <ul className="space-y-4 text-gray-700">
            <li>
              <strong>Thời gian xác nhận đơn:</strong> Chúng mình sẽ kiểm tra và xác nhận đơn hàng của bạn trong vòng <strong>4h</strong> kể từ khi phát sinh.
            </li>
            <li>
              <strong>Thời gian giao hàng:</strong>
              <ul className="ml-6 mt-2 list-disc space-y-1 opacity-80">
                <li>Khu vực nội thành: 1 - 2 ngày làm việc.</li>
                <li>Khu vực tỉnh/thành khác: 3 - 5 ngày làm việc.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4">3. Phí vận chuyển và Ưu đãi</h2>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
            <p className="mb-2"><strong>Ưu đãi Freeship:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Miễn phí vận chuyển toàn quốc cho đơn hàng từ <strong>2 sản phẩm trở lên</strong> (áp dụng khi đặt qua Facebook/Instagram).</li>
              <li>Đối với đơn hàng lẻ 1 sản phẩm: Phí ship sẽ được tính theo biểu phí của đơn vị vận chuyển (thường từ 25k - 35k).</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4">4. Kiểm tra và Nhận hàng</h2>
          <p>
            Khi nhận hàng, nàng vui lòng kiểm tra kỹ bao bì và sản phẩm. Nếu có bất kỳ dấu hiệu hư hỏng hoặc sai mẫu, hãy liên hệ ngay với Hotline <strong>0379 799 998</strong> để được hỗ trợ xử lý kịp thời.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
};

export default ShippingPolicy;
