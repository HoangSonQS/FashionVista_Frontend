import PolicyLayout from '../../components/layout/PolicyLayout';

const RefundPolicy = () => {
  return (
    <PolicyLayout title="Chính sách đổi trả">
      <section>
        <p className="italic text-gray-600 mb-6">
          "SixthSoul xin phép được hỗ trợ đổi/trả sản phẩm trong vòng 7 ngày kể từ khi nàng nhận hàng.
          Khoảng thời gian này giúp shop có thể kiểm tra và hỗ trợ nàng một cách trọn vẹn nhất,
          vì vậy rất mong nàng thông cảm và liên hệ với SixthSoul sớm nếu cần hỗ trợ nhé."
        </p>
        <p>
          Nếu trong quá trình nhận sản phẩm, chiếc váy này chưa thật sự vừa vặn hoặc có bất kỳ sai sót nào ngoài mong muốn,
          SixthSoul rất mong nàng bình tĩnh và yên tâm nhé. Chúng mình luôn sẵn sàng lắng nghe và hỗ trợ nàng.
        </p>
      </section>

      <div className="space-y-10 mt-10">
        <section className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-medium mb-4 text-black">TRƯỜNG HỢP 1: Đổi trả qua sàn Shopee hoặc TikTokShop</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium italic">
            (Ở trường hợp này nàng sẽ thao tác trực tiếp qua sàn đã đặt hàng, và nàng không mất phí khi thao tác nhaa!!)
          </p>
          <ul className="space-y-4 list-decimal list-inside text-gray-700">
            <li><strong>Bước 1:</strong> Bấm "Trả hàng/Hoàn tiền" và chọn yêu cầu trả hàng/hoàn tiền.</li>
            <li><strong>Bước 2:</strong> Chọn mục "Tôi đã nhận hàng nhưng hàng có vấn đề".</li>
            <li><strong>Bước 3:</strong> Chọn lý do "Hàng nguyên vẹn nhưng không còn nhu cầu".</li>
            <li><strong>Bước 4:</strong> Kiểm tra phương thức hoàn tiền:
              <ul className="ml-6 mt-2 space-y-2 list-disc opacity-80">
                <li><strong>Shopee:</strong> Hoàn tiền vào số dư tài khoản Shopee. Bạn có thể rút về ngân hàng sau đó.</li>
                <li><strong>TikTok:</strong> Hoàn vào tài khoản ngân hàng liên kết hoặc TikTok Balance.</li>
              </ul>
            </li>
            <li><strong>Bước 5:</strong> Gửi yêu cầu và chọn mục "Đơn vị vận chuyển đến lấy hàng" để shipper hệ thống sàn tới tận nơi lấy.</li>
            <li><strong>Bước 6:</strong> Đóng gói hàng lại và chờ shipper hệ thống của sàn đến lấy hàng nha.</li>
            <li><strong>Bước 7:</strong> Nhanh chóng đặt ngay đơn hàng mới phù hợp hơn để nhận sản phẩm sớm nhất nè.</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-medium mb-4 text-black">TRƯỜNG HỢP 2: Đổi trả qua Website và Mạng xã hội</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium italic">
            (Ở trường hợp này, nàng thông cảm chịu giúp shop phí ship 35k khi muốn shop đi đơn ngoài sàn đổi hàng trực tiếp cho nàng iu nha. Tuy nhiên nếu đổi hàng do lỗi của shop thì shop sẽ freeship cho nàng nha.)
          </p>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li><strong>Bước 1:</strong> Nhắn tin trên các kênh MXH SixthSoul để trao đổi.</li>
            <li><strong>Bước 2:</strong> Chờ 2-3 ngày để nhận hàng và đóng gói đơn cũ để khi shipper giao sản phẩm mới thì nàng gửi lại sản phẩm cũ cho shipper.</li>
          </ol>
        </section>

        <section className="border-t border-gray-100 pt-10">
          <h2 className="text-xl font-medium mb-4 text-black uppercase tracking-wider">Trường hợp khẩn cấp</h2>
          <p>Nàng hãy liên hệ Hotline SixthSoul: <strong>0379 799 998</strong> nhé.</p>
          <p className="mt-4 text-gray-600 font-light italic">
            "Mỗi thiết kế được tạo nên từ sự trân trọng và tình yêu dành cho vẻ đẹp của người phụ nữ,
            vì vậy SixthSoul tin rằng mọi vấn đề đều có thể được giải quyết nhẹ nhàng, thấu đáo và trọn vẹn cho nàng."
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
};

export default RefundPolicy;
