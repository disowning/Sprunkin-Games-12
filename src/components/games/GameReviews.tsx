'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

interface Props {
  gameId: string;
  initialReviews: Review[];
}

export default function GameReviews({ gameId, initialReviews }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          content,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error('提交评论失败');
      }

      const newReview = await response.json();
      setReviews([newReview, ...reviews]);
      setContent('');
      setRating(5);
      router.refresh();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('提交评论失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-1">
            评分
          </label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="select-input"
            required
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} 星
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            评论内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea-input"
            rows={4}
            placeholder="分享你的游戏体验..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-4 py-2"
        >
          {isSubmitting ? '提交中...' : '提交评论'}
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="card p-4">
            <div className="flex items-start space-x-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={review.user.image || '/images/default-avatar.png'}
                  alt={review.user.name || '用户'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{review.user.name}</h4>
                    <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="mt-2">{review.content}</p>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-center text-text-light/60 dark:text-text-dark/60">
            暂无评论，来发表第一条评论吧！
          </p>
        )}
      </div>
    </div>
  );
}