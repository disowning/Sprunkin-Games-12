'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface VisitorCountry {
  id: string
  countryCode: string
  countryName: string
  visits: number
  lastVisitAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

interface VisitorCountryResponse {
  countries: VisitorCountry[]
  totalVisits: number
  pagination: Pagination
}

export default function VisitorsAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<VisitorCountry[]>([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 100,
    pages: 0
  })
  const [sortBy, setSortBy] = useState('visits')
  const [sortOrder, setSortOrder] = useState('desc')
  const [chartData, setChartData] = useState<any>(null)
  const [pieChartData, setPieChartData] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchVisitorCountries()
    }
  }, [status, session, router, pagination.page, sortBy, sortOrder])

  const fetchVisitorCountries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      
      const response = await fetch(`/api/visitors/countries?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch visitor countries')
      }
      
      const data: VisitorCountryResponse = await response.json()
      setCountries(data.countries)
      setTotalVisits(data.totalVisits)
      setPagination(data.pagination)
      
      // 准备图表数据
      prepareChartData(data.countries)
    } catch (error) {
      toast.error('加载访客国家数据失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (countries: VisitorCountry[]) => {
    // 取前10个国家进行展示
    const top10Countries = [...countries]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)
    
    // 条形图数据
    setChartData({
      labels: top10Countries.map(country => country.countryName),
      datasets: [
        {
          label: '访问次数',
          data: top10Countries.map(country => country.visits),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    })
    
    // 饼图数据
    const otherVisits = countries
      .slice(10)
      .reduce((sum, country) => sum + country.visits, 0)
    
    const pieData = [...top10Countries.map(c => c.visits)]
    if (otherVisits > 0) {
      pieData.push(otherVisits)
    }
    
    const pieLabels = [...top10Countries.map(c => c.countryName)]
    if (otherVisits > 0) {
      pieLabels.push('其他国家')
    }
    
    setPieChartData({
      labels: pieLabels,
      datasets: [
        {
          data: pieData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(201, 203, 207, 0.5)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(0, 0, 0, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(0, 0, 0, 1)',
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // 如果已经按此列排序，则切换排序顺序
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // 否则，按此列排序并默认降序
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <span className="text-gray-300 ml-1">⇵</span>
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  if (loading && countries.length === 0) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div className="p-8 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">访客地区分析</h1>

      {/* 总访问统计 */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">总访问统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">全部访问次数</p>
            <p className="text-3xl font-bold">{totalVisits.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">国家/地区数量</p>
            <p className="text-3xl font-bold">{pagination.total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 统计图表 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">排名前10的国家/地区（条形图）</h2>
          {chartData && <Bar data={chartData} />}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">访问分布（饼图）</h2>
          {pieChartData && <div className="h-[300px] flex items-center justify-center"><Pie data={pieChartData} /></div>}
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">访客国家/地区详情</h2>
          <p className="text-sm text-gray-500">共 {pagination.total} 个国家/地区</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('countryName')}
                >
                  国家/地区 {getSortIcon('countryName')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('countryCode')}
                >
                  代码 {getSortIcon('countryCode')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('visits')}
                >
                  访问次数 {getSortIcon('visits')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastVisitAt')}
                >
                  最后访问时间 {getSortIcon('lastVisitAt')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {countries.map(country => (
                <tr key={country.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={`https://flagsapi.com/${country.countryCode}/flat/32.png`} 
                        alt={`${country.countryName} flag`}
                        className="mr-2 h-5 w-5"
                        onError={(e) => {
                          // 如果旗帜加载失败，隐藏图像
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <span>{country.countryName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {country.countryCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {country.visits.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(country.lastVisitAt), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                </tr>
              ))}
              
              {countries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    暂无访客国家数据
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