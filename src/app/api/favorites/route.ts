import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { gameId, action } = await request.json();

    if (!gameId || !action) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const userId = session.user.id as string;

    if (action === 'favorite') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: {
            connect: { id: gameId },
          },
        },
      });
    } else if (action === 'unfavorite') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: {
            disconnect: { id: gameId },
          },
        },
      });
    } else {
      return new NextResponse('Invalid action', { status: 400 });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}