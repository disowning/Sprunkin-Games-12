'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LineChart, 
  Activity, 
  Globe, 
  Users, 
  Gamepad as GameController, 
  BarChart,
  TrendingUp,
  Clock,
  Monitor,
  ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface TopGame {
  title: string;
  views: number;
  plays: number;
}

interface LatestPlay {
  gameTitle: string;
  userName: string;
  playedAt: string;
  deviceType: string;
  duration: number;
}

interface DeviceDistribution {
  device: string;
  count: number;
}

interface BrowserDistribution {
  browser: string;
  count: number;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGames: 0,
    totalUsers: 0,
    totalGamePlays: 0,
    totalCountries: 0,
    activeUsers30Days: 0
  })
  const [topGames, setTopGames] = useState<TopGame[]>([])
  const [latestPlays, setLatestPlays] = useState<LatestPlay[]>([])
  const [deviceDistribution, setDeviceDistribution] = useState<DeviceDistribution[]>([])
  const [browserDistribution, setBrowserDistribution] = useState<BrowserDistribution[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/analytics')
      
      if (!response.ok) {
        throw new Error('获取分析数据失败')
      }
      
      const data = await response.json()
      
      setStats(data.stats)
      setTopGames(data.topGames || [])
      setLatestPlays(data.latestPlays || [])
      setDeviceDistribution(data.deviceDistribution || [])
      setBrowserDistribution(data.browserDistribution || [])
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      toast.error('加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div className="p-8 max-w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-2xl font-bold">数据分析统计</h1>
        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button 
            onClick={fetchStats} 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition shadow-sm text-sm font-medium"
          >
            刷新数据
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition shadow-sm text-sm font-medium"
          >
            返回主页
          </Link>
        </div>
      </div>
      
      {/* 统计数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">总游戏数</p>
              <p className="text-2xl font-bold mt-1">{stats.totalGames}</p>
            </div>
            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <GameController size={20} />
            </span>
          </div>
          <div className="mt-4 text-xs text-green-600 flex items-center">
            <TrendingUp size={12} className="mr-1" />
            平台内所有游戏总数
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">注册用户</p>
              <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
            </div>
            <span className="bg-purple-50 text-purple-600 p-2 rounded-lg">
              <Users size={20} />
            </span>
          </div>
          <div className="mt-4 text-xs text-green-600 flex items-center">
            <TrendingUp size={12} className="mr-1" />
            平台注册用户总数
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">游戏游玩次数</p>
              <p className="text-2xl font-bold mt-1">{stats.totalGamePlays}</p>
            </div>
            <span className="bg-green-50 text-green-600 p-2 rounded-lg">
              <Activity size={20} />
            </span>
          </div>
          <div className="mt-4 text-xs text-green-600 flex items-center">
            <TrendingUp size={12} className="mr-1" />
            用户游玩游戏总次数
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">访问国家/地区</p>
              <p className="text-2xl font-bold mt-1">{stats.totalCountries}</p>
            </div>
            <span className="bg-orange-50 text-orange-600 p-2 rounded-lg">
              <Globe size={20} />
            </span>
          </div>
          <div className="mt-4 text-xs text-green-600 flex items-center">
            <TrendingUp size={12} className="mr-1" />
            访问者来源国家/地区数
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">近30天活跃用户</p>
              <p className="text-2xl font-bold mt-1">{stats.activeUsers30Days}</p>
            </div>
            <span className="bg-pink-50 text-pink-600 p-2 rounded-lg">
              <Users size={20} />
            </span>
          </div>
          <div className="mt-4 text-xs text-green-600 flex items-center">
            <TrendingUp size={12} className="mr-1" />
            过去30天有游玩记录的用户
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 热门游戏排行 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">热门游戏排行</h3>
            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <GameController size={20} />
            </span>
          </div>
          <div className="space-y-4">
            {topGames.map((game, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium truncate">{game.title}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="mr-3">游玩: {game.plays}</span>
                    <span>浏览: {game.views}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Link href={`/admin/games?search=${encodeURIComponent(game.title)}`}>
                    <ChevronRight className="text-gray-400 hover:text-blue-500" size={20} />
                  </Link>
                </div>
              </div>
            ))}
            {topGames.length === 0 && (
              <p className="text-gray-500 text-center py-4">暂无游戏数据</p>
            )}
          </div>
        </div>
        
        {/* 设备和浏览器分布 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">用户设备和浏览器分布</h3>
            <span className="bg-purple-50 text-purple-600 p-2 rounded-lg">
              <Monitor size={20} />
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 设备类型 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">设备类型</h4>
              <div className="space-y-2">
                {deviceDistribution.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (item.count / Math.max(...deviceDistribution.map(d => d.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="ml-3 flex-shrink-0 w-24 text-xs">
                      <span className="truncate block">{item.device}</span>
                      <span className="text-gray-500">{item.count} 次</span>
                    </div>
                  </div>
                ))}
                {deviceDistribution.length === 0 && (
                  <p className="text-gray-500 text-center py-2">暂无设备数据</p>
                )}
              </div>
            </div>
            
            {/* 浏览器分布 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">浏览器类型</h4>
              <div className="space-y-2">
                {browserDistribution.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (item.count / Math.max(...browserDistribution.map(b => b.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="ml-3 flex-shrink-0 w-24 text-xs">
                      <span className="truncate block">{item.browser}</span>
                      <span className="text-gray-500">{item.count} 次</span>
                    </div>
                  </div>
                ))}
                {browserDistribution.length === 0 && (
                  <p className="text-gray-500 text-center py-2">暂无浏览器数据</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近游戏记录 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">最近游戏记录</h3>
          <span className="bg-green-50 text-green-600 p-2 rounded-lg">
            <Clock size={20} />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">游戏</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时长</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {latestPlays.map((play, index) => (
                <tr key={index} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{play.gameTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{play.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{play.deviceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(play.duration)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(play.playedAt), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                </tr>
              ))}
              {latestPlays.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">暂无游戏记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* 游戏游玩分析 */}
        <Link href="/admin/analytics/gameplay" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">游戏游玩分析</h2>
                <GameController size={24} />
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                分析用户游戏游玩情况，包括游玩次数、时长、设备分布等数据。
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">查看详情</span>
                <div className="flex items-center gap-1 text-blue-500">
                  <Activity size={16} />
                  <span>游玩数据</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* 访客地区分析 */}
        <Link href="/admin/analytics/visitors" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">访客地区分析</h2>
                <Globe size={24} />
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                分析网站访客的地理分布情况，了解用户来自哪些国家和地区。
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">查看详情</span>
                <div className="flex items-center gap-1 text-green-500">
                  <BarChart size={16} />
                  <span>地区统计</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* 用户行为分析（预留） */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden opacity-60 cursor-not-allowed">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">用户行为分析</h2>
              <Users size={24} />
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              分析用户行为，包括停留时间、页面浏览、转化率等数据。
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">即将推出</span>
              <div className="flex items-center gap-1 text-purple-300">
                <LineChart size={16} />
                <span>开发中</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6">数据分析说明</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            <strong>游戏游玩分析：</strong> 收集用户游玩游戏的详细数据，包括游玩时长、时间、设备类型、浏览器类型等。通过这些数据，可以了解哪些游戏最受欢迎，用户偏好在什么设备上游玩，以及游玩的高峰时段。
          </p>
          <p>
            <strong>访客地区分析：</strong> 收集网站访客的地理位置信息，了解用户来自哪些国家和地区。这有助于优化网站内容，针对不同地区的用户提供本地化的体验，或调整营销策略以便更好地覆盖目标区域。
          </p>
          <p>
            <strong>数据收集方式：</strong> 系统在用户访问网站和游玩游戏时，会自动记录相关信息，包括设备类型、浏览器信息、地理位置等，所有数据均在保护用户隐私的前提下用于分析和优化网站体验。
          </p>
        </div>
      </div>
    </div>
  )
} 