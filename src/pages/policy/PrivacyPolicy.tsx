import PolicyLayout from '../../components/layout/PolicyLayout';

const PrivacyPolicy = () => {
  return (
    <PolicyLayout title="Chính sách bảo mật">
      <section className="space-y-6">
        <p>
          Chào mừng bạn đến với <strong>SixthSoul</strong>. Chúng tôi cực kỳ coi trọng quyền riêng tư của khách hàng và cam kết bảo vệ thông tin cá nhân mà bạn cung cấp cho chúng mình. Chính sách bảo mật này giải thích cách chúng mình thu thập, sử dụng và bảo mật thông tin của bạn.
        </p>

        <div>
          <h2 className="text-xl font-medium mb-3">1. Thu thập thông tin</h2>
          <p>Chúng mình thu thập các thông tin sau khi bạn đặt hàng hoặc đăng ký tài khoản:</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
            <li>Họ tên, số điện thoại, địa chỉ nhận hàng.</li>
            <li>Email để gửi xác nhận đơn hàng và thông tin ưu đãi.</li>
            <li>Lịch sử mua hàng để hỗ trợ bảo hành và đổi trả.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3">2. Sử dụng thông tin</h2>
          <p>Thông tin của bạn được sử dụng để:</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
            <li>Xử lý và giao đơn hàng của bạn nhanh nhất.</li>
            <li>Cung cấp hỗ trợ khách hàng và giải quyết khiếu nại.</li>
            <li>Gửi thông báo về các bộ sưu tập mới hoặc chương trình khuyến mãi (nếu bạn đồng ý).</li>
            <li>Cải thiện chất lượng dịch vụ và trải nghiệm mua sắm trên website.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3">3. Bảo mật thông tin</h2>
          <p>
            Chúng mình cam kết không bán, chia sẻ hay trao đổi thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào khi không có sự đồng ý của bạn, trừ trường hợp phục vụ việc giao nhận hàng (cung cấp tên, số điện thoại và địa chỉ cho đơn vị vận chuyển).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3">4. Quyền của khách hàng</h2>
          <p>
            Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào bằng cách đăng nhập vào tài khoản hoặc liên hệ trực tiếp với SixthSoul.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <p className="font-medium">Mọi thắc mắc về chính sách bảo mật, nàng vui lòng liên hệ:</p>
          <p className="mt-2"><strong>CÔNG TY TNHH THỜI TRANG SIXTHSOUL VN</strong></p>
          <p>Hotline: 0379 799 998</p>
          <p>Email: [Email sẽ được cập nhật sau]</p>
        </div>
      </section>
    </PolicyLayout>
  );
};

export default PrivacyPolicy;
