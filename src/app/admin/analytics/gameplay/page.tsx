'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface GamePlay {
  id: string
  gameId: string
  sessionId: string
  ipAddress: string
  country: string | null
  city: string | null
  deviceType: string | null
  browserInfo: string | null
  duration: number | null
  playedAt: string
  game: {
    title: string
    slug: string
  }
  user: {
    name: string | null
    email: string
  } | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

interface GamePlayResponse {
  records: GamePlay[]
  pagination: Pagination
}

export default function GamePlayAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  })
  const [gameFilter, setGameFilter] = useState('')
  const [chartData, setChartData] = useState<any>(null)
  const [deviceData, setDeviceData] = useState<any>(null)
  const [browserData, setBrowserData] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchGamePlays()
    }
  }, [status, session, router, pagination.page, gameFilter])

  const fetchGamePlays = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      
      if (gameFilter) {
        params.append('gameId', gameFilter)
      }
      
      const response = await fetch(`/api/gameplay?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch game plays')
      }
      
      const data: GamePlayResponse = await response.json()
      setGamePlays(data.records)
      setPagination(data.pagination)
      
      // 准备图表数据
      prepareChartData(data.records)
    } catch (error) {
      toast.error('加载游戏游玩记录失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (records: GamePlay[]) => {
    // 游戏游玩时长统计图表
    const gameStats: {[key: string]: {count: number, totalDuration: number}} = {}
    records.forEach(record => {
      if (!gameStats[record.game.title]) {
        gameStats[record.game.title] = { count: 0, totalDuration: 0 }
      }
      gameStats[record.game.title].count++
      if (record.duration) {
        gameStats[record.game.title].totalDuration += record.duration
      }
    })

    // 设备类型统计
    const deviceStats: {[key: string]: number} = {}
    records.forEach(record => {
      const deviceType = record.deviceType || 'Unknown'
      deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1
    })

    // 浏览器统计
    const browserStats: {[key: string]: number} = {}
    records.forEach(record => {
      const browser = record.browserInfo || 'Unknown'
      browserStats[browser] = (browserStats[browser] || 0) + 1
    })

    // 准备图表数据
    setChartData({
      labels: Object.keys(gameStats),
      datasets: [
        {
          label: '游玩次数',
          data: Object.values(gameStats).map(stat => stat.count),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: '平均游玩时长(秒)',
          data: Object.values(gameStats).map(stat => 
            stat.totalDuration > 0 ? Math.round(stat.totalDuration / stat.count) : 0
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    })

    // 设备类型图表数据
    setDeviceData({
      labels: Object.keys(deviceStats),
      datasets: [
        {
          label: '设备类型分布',
          data: Object.values(deviceStats),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        }
      ]
    })

    // 浏览器图表数据
    setBrowserData({
      labels: Object.keys(browserStats),
      datasets: [
        {
          label: '浏览器分布',
          data: Object.values(browserStats),
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        }
      ]
    })
  }

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }))
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '未记录'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes === 0) {
      return `${remainingSeconds}秒`
    }
    
    return `${minutes}分${remainingSeconds}秒`
  }

  if (loading && gamePlays.length === 0) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div className="p-8 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">游戏游玩分析</h1>

      {/* 统计图表 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">游戏游玩统计</h2>
          {chartData && <Bar data={chartData} />}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">设备类型分布</h2>
          {deviceData && <div className="h-[300px]"><Bar data={deviceData} /></div>}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">浏览器分布</h2>
          {browserData && <div className="h-[300px]"><Bar data={browserData} /></div>}
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">游戏游玩记录</h2>
          <p className="text-sm text-gray-500">共 {pagination.total} 条记录</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">游戏</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地点</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">游玩时长</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">游玩时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gamePlays.map(play => (
                <tr key={play.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={`/games/${play.game.slug}`} 
                      className="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      {play.game.title}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {play.user ? (
                      <div>
                        <div>{play.user.name || '未命名用户'}</div>
                        <div className="text-xs text-gray-500">{play.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">匿名用户</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{play.country || '未知国家'}</div>
                    <div className="text-xs text-gray-500">{play.city || '未知城市'}</div>
                    <div className="text-xs text-gray-400">{play.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{play.deviceType || '未知设备'}</div>
                    <div className="text-xs text-gray-500">{play.browserInfo || '未知浏览器'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDuration(play.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(play.playedAt), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                </tr>
              ))}
              
              {gamePlays.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    暂无游戏游玩记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 flex justify-between items-center border-t">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded text-sm disabled:opacity-50"
            >
              上一页
            </button>
            
            <div className="text-sm text-gray-700">
              第 {pagination.page} 页，共 {pagination.pages} 页
            </div>
            
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded text-sm disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 