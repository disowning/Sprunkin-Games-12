'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Bar,
  Line,
  Pie, 
  Doughnut 
} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Globe, Users, Calendar, Server, BarChart3, PieChart, Activity } from 'lucide-react'

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// 定义类型
interface ActiveUser {
  userId: string;
  name: string;
  email: string;
  playCount: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState({
    usersCount: 0,
    gamesCount: 0,
    gamePlaysCount: 0,
    visitorCountriesCount: 0
  })
  
  // 游戏访问量图表数据
  const [gameViewsChart, setGameViewsChart] = useState({
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    datasets: [
      {
        label: '游戏访问量',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  })
  
  // 热门游戏图表数据
  const [popularGamesChart, setPopularGamesChart] = useState({
    labels: ['暂无数据'],
    datasets: [
      {
        label: '游玩次数',
        data: [0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  })

  // 添加新图表状态
  const [dailyStatsChart, setDailyStatsChart] = useState({
    labels: ['暂无数据'],
    datasets: [
      {
        label: '每日游玩次数',
        data: [0],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  })
  
  const [deviceStatsChart, setDeviceStatsChart] = useState({
    labels: ['暂无数据'],
    datasets: [
      {
        label: '设备类型分布',
        data: [0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  })
  
  const [browserStatsChart, setBrowserStatsChart] = useState({
    labels: ['暂无数据'],
    datasets: [
      {
        label: '浏览器分布',
        data: [0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  })
  
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/auth/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }

    setAuthorized(true);
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/dashboard')
      
      if (!response.ok) {
        throw new Error('获取仪表盘数据失败')
      }
      
      const data = await response.json()
      
      setStats(data.stats)
      
      if (data.gameViewsChart) {
        setGameViewsChart({
          labels: data.gameViewsChart.labels,
          datasets: [
            {
              label: '游戏访问量',
              data: data.gameViewsChart.data,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
          ],
        })
      }
      
      if (data.popularGamesChart) {
        setPopularGamesChart({
          labels: data.popularGamesChart.labels.length > 0 
            ? data.popularGamesChart.labels 
            : ['暂无数据'],
          datasets: [
            {
              label: '游玩次数',
              data: data.popularGamesChart.data.length > 0 
                ? data.popularGamesChart.data 
                : [0],
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        })
      }
      
      // 设置新的图表数据
      if (data.dailyStats) {
        setDailyStatsChart({
          labels: data.dailyStats.labels,
          datasets: [
            {
              label: '每日游玩次数',
              data: data.dailyStats.data,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.3,
            },
          ],
        })
      }
      
      if (data.deviceStats) {
        setDeviceStatsChart({
          labels: data.deviceStats.labels,
          datasets: [
            {
              label: '设备类型分布',
              data: data.deviceStats.data,
              backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        })
      }
      
      if (data.browserStats) {
        setBrowserStatsChart({
          labels: data.browserStats.labels,
          datasets: [
            {
              label: '浏览器分布',
              data: data.browserStats.data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        })
      }
      
      if (data.activeUsers) {
        setActiveUsers(data.activeUsers)
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
      toast.error('加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (!authorized || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition shadow-sm"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">返回主站</span>
        </Link>
      </div>
      
      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">用户总数</h3>
            <Users className="text-blue-100" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.usersCount}</p>
          <p className="mt-2 text-blue-100 text-sm">注册用户总数</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">游戏总数</h3>
            <Server className="text-green-100" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.gamesCount}</p>
          <p className="mt-2 text-green-100 text-sm">平台游戏总数</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">游戏总游玩次数</h3>
            <Activity className="text-purple-100" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.gamePlaysCount}</p>
          <p className="mt-2 text-purple-100 text-sm">用户游玩游戏总次数</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">访问国家/地区</h3>
            <Globe className="text-orange-100" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.visitorCountriesCount}</p>
          <p className="mt-2 text-orange-100 text-sm">访问者来源国家/地区数</p>
        </div>
      </div>
      
      {/* 图表 - 第一行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 游戏访问量趋势图 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">游戏访问量趋势</h3>
            <BarChart3 size={20} className="text-blue-500" />
          </div>
          <div className="h-80">
            <Line 
              data={gameViewsChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: '近7个月游戏访问量'
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* 热门游戏排行图 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">热门游戏排行</h3>
            <Activity size={20} className="text-pink-500" />
          </div>
          <div className="h-80">
            <Bar 
              data={popularGamesChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const, // 横向柱状图
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: '游戏游玩次数排行'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* 图表 - 第二行 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 每日游玩统计 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">每日游玩统计</h3>
            <Calendar size={20} className="text-teal-500" />
          </div>
          <div className="h-64">
            <Line 
              data={dailyStatsChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: '近7天每日游玩次数'
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* 设备类型分布 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">设备类型分布</h3>
            <Server size={20} className="text-blue-500" />
          </div>
          <div className="h-64 flex justify-center items-center">
            <Doughnut 
              data={deviceStatsChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  title: {
                    display: true,
                    text: '用户设备分布'
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* 浏览器分布 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">浏览器分布</h3>
            <PieChart size={20} className="text-purple-500" />
          </div>
          <div className="h-64 flex justify-center items-center">
            <Pie 
              data={browserStatsChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  title: {
                    display: true,
                    text: '用户浏览器分布'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* 活跃用户列表 */}
      {activeUsers && activeUsers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">最活跃用户</h3>
            <Users size={20} className="text-indigo-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    游玩次数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeUsers.map((user, index) => (
                  <tr key={user.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.playCount}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 在仪表盘添加域名管理卡片 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">域名管理</h3>
        <Link
          href="/admin/domains"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Globe size={18} />
          <span>管理域名</span>
        </Link>
      </div>
    </div>
  )
}