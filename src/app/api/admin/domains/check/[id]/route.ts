import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 等待解析 params
    const { id } = await context.params;
    
    const domain = await prisma.domainbinding.findUnique({
      where: { id: id },
    });

    if (!domain) {
      return NextResponse.json({ error: '域名不存在' }, { status: 404 });
    }

    // 检查DNS记录
    try {
      const records = await resolveCname(domain.domain);
      const isValid = records.some(record => 
        record.includes('your-site.vercel.app')
      );

      await prisma.domainbinding.update({
        where: { id: id },
        data: { 
          isActive: isValid,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        status: isValid ? 'valid' : 'invalid',
        records,
      });
    } catch (dnsError) {
      return NextResponse.json({
        status: 'error',
        error: 'DNS记录未找到或配置错误',
      });
    }
  } catch (error) {
    console.error('Error checking domain:', error);
    return NextResponse.json(
      { error: 'Failed to check domain' },
      { status: 500 }
    );
  }
} 