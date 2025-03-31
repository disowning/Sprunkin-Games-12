'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Home, Search, X, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClickAway } from 'react-use';

interface NavItem {
  id: string;
  title: string;
  path: string;
  order: number;
  isActive: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
}

export default function Navbar() {
  const { data: session } = useSession();
  const [logoName, setLogoName] = useState('Sprunkin');
  const [logoUrl, setLogoUrl] = useState('');
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // 搜索相关状态
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();
  
  // 点击外部关闭搜索结果
  useClickAway(searchRef, () => {
    setShowResults(false);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/config');
        const data = await response.json();
        
        if (data.configs && data.configs.logo_name) {
          setLogoName(data.configs.logo_name);
        }
        
        if (data.configs && data.configs.logo_url) {
          setLogoUrl(data.configs.logo_url);
        }
        
        setNavItems(data.navItems.filter((item: NavItem) => item.isActive));
      } catch (error) {
        console.error('Failed to fetch navbar data:', error);
      }
    };

    fetchData();
    setMounted(true);
    
    // 添加滚动监听
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // 搜索功能
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.games || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      router.push(`/games?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setShowResults(false);
    }
  };
  
  const navigateToGame = (slug: string) => {
    router.push(`/game/${slug}`);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md py-2' 
          : 'bg-white py-3'}
      `}
    >
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105 cursor-pointer" 
          title="Home"
          aria-label="Home"
        >
          {mounted && logoUrl ? (
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src={logoUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
          ) : null}
          
          <span 
            suppressHydrationWarning 
            className="text-2xl font-bold text-gray-900 hover:text-blue-600"
          >
            {logoName}
          </span>
        </Link>

        {/* Search bar - Added in the middle */}
        <div className="max-w-md w-full mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search games..."
              className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </form>
          
          {/* Search results dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map(game => (
                    <button
                      key={game.id}
                      onClick={() => navigateToGame(game.slug)}
                      className="flex items-center p-3 w-full text-left hover:bg-gray-50"
                    >
                      <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                        <Image
                          src={game.thumbnailUrl}
                          alt={game.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <span className="text-gray-800">{game.title}</span>
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-gray-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-blue-600 hover:underline text-sm w-full text-center"
                    >
                      See all results for "{searchTerm}"
                    </button>
                  </div>
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  No games found
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation Links and settings */}
        <div className="flex items-center gap-4">
          {mounted && session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm"
            >
              <Settings size={18} />
              <span className="font-medium">管理后台</span>
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-sm"
          >
            <Home size={18} />
            <span className="font-medium">Home</span>
          </Link>
        </div>
      </div>
      {/* 底部细线条 */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
    </nav>
  );
} 