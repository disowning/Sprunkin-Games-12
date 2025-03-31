import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from '@/components/NextAuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientToaster from '@/components/ClientToaster';
import { prisma } from '@/lib/prisma';

const inter = Inter({ subsets: ['latin'] });

// 动态获取网站设置
async function getSiteSettings() {
  try {
    const settings = await prisma.sitesettings.findMany({
      where: {
        key: {
          in: ['siteTitle', 'siteFavicon']
        }
      }
    });
    
    return {
      siteTitle: settings.find(s => s.key === 'siteTitle')?.value || 'Sprunkin - Game Platform',
      siteFavicon: settings.find(s => s.key === 'siteFavicon')?.value || '/favicon.ico'
    };
  } catch {
    // 出错时返回默认值
    return {
      siteTitle: 'Sprunkin - Game Platform',
      siteFavicon: '/favicon.ico'
    };
  }
}

// 生成元数据
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle.split(' - ')[0]}`
    },
    icons: {
      icon: settings.siteFavicon,
      shortcut: settings.siteFavicon,
      apple: settings.siteFavicon,
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 获取设置数据，避免在JSX中使用await
  const settings = await getSiteSettings();
  
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="icon" href={settings.siteFavicon} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`} suppressHydrationWarning>
        <NextAuthProvider>
          <Navbar />
          <main className="pt-[4.5rem] flex-grow">
            {children}
          </main>
          <Footer />
          <ClientToaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}