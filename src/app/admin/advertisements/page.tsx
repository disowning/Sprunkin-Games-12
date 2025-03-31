'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

interface Advertisement {
  id: string
  name: string
  location: string
  adType: string
  adCode: string
  isActive: boolean
  order: number
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

const locationOptions = [
  { value: 'site_header', label: '站点顶部' },
  { value: 'site_footer', label: '站点底部' },
  { value: 'home_top', label: '首页顶部' },
  { value: 'home_bottom', label: '首页底部' },
  { value: 'game_list_top', label: '游戏列表顶部' },
  { value: 'game_list_bottom', label: '游戏列表底部' },
  { value: 'game_detail_top', label: '游戏详情顶部' },
  { value: 'game_detail_bottom', label: '游戏详情底部' },
  { value: 'game_detail_sidebar', label: '游戏详情侧边栏' },
  { value: 'between_games', label: '游戏之间' },
]

const adTypeOptions = [
  { value: 'google_adsense', label: '谷歌广告联盟 (AdSense)' },
  { value: 'ad_network', label: '广告联盟' },
  { value: 'custom_code', label: '自定义代码' },
  { value: 'affiliate', label: '联盟营销链接' },
]

export default function AdvertisementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    adType: '',
    adCode: '',
    isActive: true,
    order: 0,
    startDate: '',
    endDate: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchAdvertisements()
    }
  }, [status, session, router])

  const fetchAdvertisements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/advertisements')
      const data = await response.json()
      
      if (data.advertisements) {
        setAdvertisements(data.advertisements)
      }
    } catch (error) {
      toast.error('加载广告数据失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      adType: '',
      adCode: '',
      isActive: true,
      order: 0,
      startDate: '',
      endDate: ''
    })
    setEditingAd(null)
    setShowAddForm(false)
  }

  const handleAddNewClick = () => {
    resetForm()
    setShowAddForm(true)
  }

  const handleEditClick = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({
      name: ad.name,
      location: ad.location,
      adType: ad.adType,
      adCode: ad.adCode,
      isActive: ad.isActive,
      order: ad.order,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
    })
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location || !formData.adType || !formData.adCode) {
      toast.error('请填写所有必填字段')
      return
    }
    
    try {
      setSubmitting(true)
      
      if (editingAd) {
        // 更新广告
        const response = await fetch(`/api/admin/advertisements/${editingAd.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          toast.success('广告更新成功')
          await fetchAdvertisements()
          resetForm()
        } else {
          const data = await response.json()
          toast.error(data.message || '更新失败')
        }
      } else {
        // 创建新广告
        const response = await fetch('/api/admin/advertisements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          toast.success('广告创建成功')
          await fetchAdvertisements()
          resetForm()
        } else {
          const data = await response.json()
          toast.error(data.message || '创建失败')
        }
      }
    } catch (error) {
      toast.error('操作失败')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm('确定要删除此广告吗？此操作不可撤销。')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('广告已删除')
        await fetchAdvertisements()
      } else {
        const data = await response.json()
        toast.error(data.message || '删除失败')
      }
    } catch (error) {
      toast.error('删除失败')
      console.error(error)
    }
  }

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      const response = await fetch(`/api/admin/advertisements/${ad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !ad.isActive })
      })
      
      if (response.ok) {
        toast.success(`广告已${!ad.isActive ? '激活' : '禁用'}`)
        await fetchAdvertisements()
      } else {
        const data = await response.json()
        toast.error(data.message || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
      console.error(error)
    }
  }

  const getLocationLabel = (value: string) => {
    const option = locationOptions.find(opt => opt.value === value)
    return option ? option.label : value
  }

  const getAdTypeLabel = (value: string) => {
    const option = adTypeOptions.find(opt => opt.value === value)
    return option ? option.label : value
  }

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">广告管理</h1>
        <button
          onClick={handleAddNewClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          <Plus size={16} />
          添加广告
        </button>
      </div>

      {/* 广告列表 */}
      {advertisements.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">暂无广告数据，请添加新广告</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顺序</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advertisements.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{ad.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getLocationLabel(ad.location)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getAdTypeLabel(ad.adType)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{ad.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`p-1 rounded text-white ${
                          ad.isActive ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                        title={ad.isActive ? '禁用' : '启用'}
                      >
                        {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleEditClick(ad)}
                        className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                        title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 添加/编辑广告表单 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAd ? '编辑广告' : '添加新广告'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* 广告名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      广告名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例：首页顶部谷歌广告"
                      required
                    />
                  </div>
                  
                  {/* 广告位置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      广告位置 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">选择位置</option>
                      {locationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* 广告类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      广告类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="adType"
                      value={formData.adType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">选择类型</option>
                      {adTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* 显示顺序 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      显示顺序
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">数字越小显示越靠前</p>
                  </div>
                  
                  {/* 开始日期 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      开始日期
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">不设置则立即生效</p>
                  </div>
                  
                  {/* 结束日期 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      结束日期
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">不设置则一直有效</p>
                  </div>
                  
                  {/* 状态 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                      启用广告
                    </label>
                  </div>
                </div>
                
                {/* 广告代码 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    广告代码 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="adCode"
                    value={formData.adCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={8}
                    placeholder={`例：<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890"
     crossorigin="anonymous"></script>
<!-- 广告单元代码 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
                    required
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    请输入完整的广告代码，包括<code>&lt;script&gt;</code>标签
                  </p>
                </div>
                
                {/* 表单操作按钮 */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '保存中...' : editingAd ? '更新广告' : '添加广告'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 