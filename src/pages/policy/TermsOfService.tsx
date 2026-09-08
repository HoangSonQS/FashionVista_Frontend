import PolicyLayout from '../../components/layout/PolicyLayout';

const TermsOfService = () => {
  return (
    <PolicyLayout title="Điều khoản dịch vụ">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4 uppercase tracking-wider">1. Chấp thuận các điều khoản</h2>
          <p>
            Chào mừng bạn đến với <strong>SixthSoul.com</strong>. Khi truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4 uppercase tracking-wider">2. Quyền sở hữu trí tuệ</h2>
          <p>
            Tất cả nội dung trên website, bao gồm nhưng không giới hạn ở: hình ảnh sản phẩm, thiết kế, logo, slogan, văn bản và video đều thuộc quyền sở hữu của <strong>SixthSoul</strong>. Mọi hành vi sao chép, sử dụng khi chưa được sự đồng ý bằng văn bản của SixthSoul đều là vi phạm pháp luật.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4 uppercase tracking-wider">3. Tài khoản và Thông tin cá nhân</h2>
          <p>
            Khi đăng ký tài khoản, bạn có trách nhiệm bảo mật mật khẩu và thông tin tài khoản của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn sẽ do bạn chịu trách nhiệm. Vui lòng cung cấp thông tin chính xác để chúng mình có thể hỗ trợ giao hàng và CSKH tốt nhất.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4 uppercase tracking-wider">4. Đơn hàng và Thanh toán</h2>
          <p>
            SixthSoul có quyền từ chối hoặc hủy đơn hàng của bạn vì bất kỳ lý do gì liên quan đến lỗi hệ thống, sai sót thông tin giá cả hoặc nghi ngờ gian lận. Bạn có thể thanh toán qua các hình thức được hỗ trợ tại trang Thanh toán.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4 uppercase tracking-wider">5. Thay đổi điều khoản</h2>
          <p>
            Chúng tôi có thể cập nhật các Điều khoản dịch vụ này theo thời gian mà không cần thông báo trước. Việc bạn tiếp tục sử dụng website sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-100 italic text-gray-500">
          <p>Cập nhật lần cuối: 15/04/2026</p>
        </div>
      </section>
    </PolicyLayout>
  );
};

export default TermsOfService;
