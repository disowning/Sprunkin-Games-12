import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileForm from '@/components/profile/ProfileForm';
import FavoriteGames from '@/components/profile/FavoriteGames';
import UserReviews from '@/components/profile/UserReviews';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: true,
      reviews: {
        include: {
          game: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <div className="p-6">
            <ProfileForm user={user} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">My Favorites</h2>
          </div>
          <div className="p-6">
            <FavoriteGames games={user.favorites} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">My Reviews</h2>
          </div>
          <div className="p-6">
            <UserReviews reviews={user.reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}