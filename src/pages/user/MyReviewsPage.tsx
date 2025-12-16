import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Calendar } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import type { ReviewSummary } from '../../types/review';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { LoginModal } from '../../components/common/LoginModal';

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getMyReviews();
        setReviews(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          setShowLoginModal(true);
        } else {
          showToast('Không thể tải danh sách đánh giá.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    void loadReviews();
  }, [showToast]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-[#4DA3E8] text-[#4DA3E8]'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
                <div className="h-4 w-1/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-full rounded bg-gray-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-light text-[#4DA3E8] tracking-wide uppercase">
            Đánh giá của tôi
          </h1>
          {reviews.length > 0 && (
            <span className="text-sm text-gray-600 font-light">
              {reviews.length} đánh giá
            </span>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-light text-gray-600 mb-2">Chưa có đánh giá nào</h2>
            <p className="text-sm text-gray-500 mb-6">Bạn chưa đánh giá sản phẩm nào.</p>
            <Link
              to="/products"
              className="inline-block border border-[#4DA3E8] text-[#4DA3E8] px-6 py-2 text-sm font-light tracking-wider uppercase hover:bg-[#4DA3E8] hover:text-white transition-all duration-300"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <Link
                      to={`/products/${review.productSlug}`}
                      className="text-lg font-light text-[#4DA3E8] hover:underline transition-all"
                    >
                      {review.productName}
                    </Link>
                    <div className="mt-2 flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500 font-light">
                        {review.rating} / 5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 font-light leading-relaxed mt-3">
                    {review.comment}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/products/${review.productSlug}`}
                    className="text-xs text-[#4DA3E8] hover:underline font-light tracking-wide uppercase"
                  >
                    Xem sản phẩm →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default MyReviewsPage;

