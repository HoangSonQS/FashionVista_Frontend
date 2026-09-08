import PolicyLayout from '../../components/layout/PolicyLayout';

const About = () => {
  return (
    <PolicyLayout title="Về SixthSoul">
      <div className="space-y-16">
        {/* Story Section */}
        <section className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-serif font-medium mb-8">Câu chuyện thương hiệu</h2>
          <div className="space-y-6 text-lg text-gray-700 font-light leading-relaxed">
            <p>
              "Người phụ nữ xinh đẹp nhất là khi họ sống thật với bản thân."
            </p>
            <p>
              Đó là niềm tin mãnh liệt đã khai sinh ra <strong>SixthSoul</strong>. Chúng mình tin rằng mỗi bộ trang phục không chỉ đơn thuần là vải vóc, mà là ngôn ngữ của tâm hồn, là cách nàng tôn vinh vẻ đẹp độc bản của chính mình.
            </p>
            <p>
              Tại SixthSoul, mỗi thiết kế đều được chăm chút từ sự trân trọng và tình yêu dành cho phái đẹp. Chúng mình mong muốn đồng hành cùng nàng trong hành trình chọn sự dịu dàng với chính mình, chọn sống chậm lại và lắng nghe cảm xúc bản thân.
            </p>
          </div>
        </section>

        {/* Vision/Style Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-y border-gray-100 py-16">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">Phong cách & Triết lý</h3>
            <p className="text-xl font-serif leading-snug">
              Mỗi quyết định của nàng không chỉ là chọn một chiếc váy, mà còn là chọn một phong cách sống.
            </p>
          </div>
          <div className="space-y-4 text-gray-600">
            <p>
              SixthSoul hướng tới những thiết kế mang hơi thở hiện đại nhưng vẫn giữ được nét nữ tính, thanh lịch. Chúng mình chú trọng vào chất liệu và sự tinh tế trong từng đường kim mũi chỉ, để khi khoác lên mình sản phẩm của SixthSoul, nàng luôn cảm thấy tự tin và tràn đầy yêu thương.
            </p>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-gray-50 p-10 md:p-16 rounded-[3rem] text-center">
          <span className="text-4xl text-gray-300 block mb-6 px-10">“</span>
          <p className="text-xl md:text-2xl font-serif italic text-gray-800 leading-relaxed mb-8">
            Mong rằng thiết kế này của SixthSoul sẽ không chỉ được mặc, mà còn được cảm,
            để trở thành một phần nhỏ trong những khoảnh khắc dịu dàng và tự tin của nàng.
          </p>
          <span className="text-xs uppercase tracking-[0.4em] font-bold text-gray-400">
            LIVE YOUR BEAUTY. LIVE YOUR SIXTHSOUL.
          </span>
        </section>

        {/* Footer info for About */}
        <section className="text-center text-gray-500 text-sm italic">
          <p>SixthSoul xin gửi lời cảm ơn chân thành đến nàng vì đã tin yêu và lựa chọn chúng mình.</p>
        </section>
      </div>
    </PolicyLayout>
  );
};

export default About;
