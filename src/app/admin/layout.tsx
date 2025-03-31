'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Users, 
  Globe, 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Image,
  Folders,
  BadgePercent,
  Network,
  Search
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [dropdowns, setDropdowns] = useState({
    games: false,
    users: false,
    settings: false,
    ads: false,
    categories: false,
    tags: false,
    analytics: false,
    domains: false,
    seo: false
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.replace('/auth/login')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.replace('/')
      return
    }
  }, [session, status, router])

  const handleDropdownToggle = (dropdown: keyof typeof dropdowns) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }))
  }

  if (!session && status !== 'loading') {
    return null
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} h-screen bg-white dark:bg-gray-800 shadow-md transition-all duration-300 flex flex-col`}>
        {/* 边栏头部 */}
        <div className="p-4 flex items-center justify-between border-b">
          {isSidebarOpen && (
            <Link href="/admin" className="text-lg font-semibold text-gray-800 dark:text-white">
              管理后台
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isSidebarOpen ? (
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400 transform rotate-180" />
            )}
          </button>
        </div>
        
        {/* 侧边栏菜单 */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {/* 仪表盘 */}
            <li>
              <Link 
                href="/admin"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin') && !isActive('/admin/games') && !isActive('/admin/users') && !isActive('/admin/settings')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>仪表盘</span>}
              </Link>
            </li>
            
            {/* 游戏管理 */}
            <li>
              <button
                className={`w-full flex items-center justify-between p-2 rounded-lg ${
                  isActive('/admin/games')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleDropdownToggle('games')}
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-3" />
                  {isSidebarOpen && <span>游戏管理</span>}
                </div>
                {isSidebarOpen && (
                  dropdowns.games ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                )}
              </button>
              {isSidebarOpen && dropdowns.games && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li>
                    <Link 
                      href="/admin/games"
                      className={`block p-2 rounded-lg ${
                        isActive('/admin/games') && !isActive('/admin/games/new')
                          ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      游戏列表
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/admin/games/new"
                      className={`block p-2 rounded-lg ${
                        isActive('/admin/games/new')
                          ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      添加游戏
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* 用户管理 */}
            <li>
              <button
                className={`w-full flex items-center justify-between p-2 rounded-lg ${
                  isActive('/admin/users')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleDropdownToggle('users')}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  {isSidebarOpen && <span>用户管理</span>}
                </div>
                {isSidebarOpen && (
                  dropdowns.users ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                )}
              </button>
              {isSidebarOpen && dropdowns.users && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li>
                    <Link 
                      href="/admin/users"
                      className={`block p-2 rounded-lg ${
                        isActive('/admin/users') && !isActive('/admin/users/create')
                          ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      用户列表
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/admin/users/create"
                      className={`block p-2 rounded-lg ${
                        isActive('/admin/users/create')
                          ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      创建用户
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            
            {/* 分类管理 */}
            <li>
              <Link 
                href="/admin/categories"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/categories')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Folders className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>分类管理</span>}
              </Link>
            </li>

            {/* 标签管理 */}
            <li>
              <Link 
                href="/admin/tags"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/tags')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Tag className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>标签管理</span>}
              </Link>
            </li>

            {/* 广告管理 */}
            <li>
              <Link 
                href="/admin/advertisements"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/advertisements')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <BadgePercent className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>广告管理</span>}
              </Link>
            </li>

            {/* 域名管理 */}
            <li>
              <Link 
                href="/admin/domains"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/domains')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Network className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>域名管理</span>}
              </Link>
            </li>

            {/* 数据分析 */}
            <li>
              <Link 
                href="/admin/analytics"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/analytics')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>数据分析</span>}
              </Link>
            </li>

            {/* SEO设置 */}
            <li>
              <Link 
                href="/admin/seo"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/seo')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Search className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>SEO设置</span>}
              </Link>
            </li>

            {/* 系统设置 */}
            <li>
              <Link 
                href="/admin/settings"
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/admin/settings')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                {isSidebarOpen && <span>系统设置</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* 侧边栏底部 */}
        <div className="p-4 border-t">
          <Link 
            href="/"
            className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Globe className="h-5 w-5 mr-3" />
            {isSidebarOpen && <span>返回网站</span>}
          </Link>
        </div>
      </aside>
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}