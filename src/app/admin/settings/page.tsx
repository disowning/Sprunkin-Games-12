'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface SiteConfig {
  [key: string]: string
}

interface NavItem {
  id: string
  title: string
  path: string
  order: number
  isActive: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [configs, setConfigs] = useState<SiteConfig>({})
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [logoName, setLogoName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [newNavItem, setNewNavItem] = useState({
    title: '',
    path: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [siteTitle, setSiteTitle] = useState('')
  const [siteFavicon, setSiteFavicon] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setIsLoading(true)

      // 获取配置数据
      const configResponse = await fetch('/api/admin/config')
      if (!configResponse.ok) {
        throw new Error('配置加载失败')
      }
      const configData = await configResponse.json()
      
      if (configData.success) {
        const configs = configData.configs || {}
        setConfigs(configs)
        
        // 更新各个配置项
        setLogoName(configs.logo_name || '')
        setLogoUrl(configs.logo_url || '')
        setPreviewUrl(configs.logo_url || '')
        
        // 设置网站标题和图标
        const title = configs.site_title || ''
        const favicon = configs.site_favicon || '/favicon.ico'
        
        setSiteTitle(title)
        setSiteFavicon(favicon)
        
        // 更新页面标题和图标
        document.title = title || 'Sprunkin'
        const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement
        if (faviconLink) {
          faviconLink.href = favicon
        }
      } else {
        console.error('配置加载失败:', configData.message)
        toast.error(configData.message || '配置加载失败')
      }

      // 获取导航项数据
      const navResponse = await fetch('/api/admin/nav')
      if (!navResponse.ok) {
        throw new Error('导航项加载失败')
      }
      const navData = await navResponse.json()
      
      if (navData.success) {
        const sortedItems = (navData.items || []).sort((a: NavItem, b: NavItem) => a.order - b.order)
        setNavItems(sortedItems)
      } else {
        console.error('导航项加载失败:', navData.message)
        toast.error(navData.message || '导航项加载失败')
      }
    } catch (error) {
      console.error('数据加载失败:', error)
      toast.error(error instanceof Error ? error.message : '数据加载失败')
    } finally {
      setLoading(false)
      setIsLoading(false)
    }
  }

  const updateLogoName = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'logo_name',
          value: logoName
        })
      })

      const data = await response.json()
      if (data.success) {
        setConfigs({
          ...configs,
          logo_name: logoName
        })
        toast.success('Logo名称更新成功')
      } else {
        throw new Error(data.message || '更新失败')
      }
    } catch (error) {
      console.error('更新Logo名称失败:', error)
      toast.error(error instanceof Error ? error.message : '更新失败')
    }
  }
  
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // 创建本地预览URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setLogoUrl(''); // 清空URL输入框，因为现在使用文件上传
    }
  };
  
  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
    if (url) {
      setPreviewUrl(url);
      setLogoFile(null); // 清空文件选择，因为现在使用URL
    } else {
      setPreviewUrl('');
    }
  };
  
  const updateLogoImage = async () => {
    try {
      setLoading(true);
      let finalLogoUrl = logoUrl;
      
      // 如果有文件上传，先上传文件
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('文件上传失败');
        }
        
        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.message || '文件上传失败');
        }
        finalLogoUrl = uploadData.url;
      }
      
      // 保存Logo URL到配置
      if (finalLogoUrl) {
        const response = await fetch('/api/admin/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: 'logo_url',
            value: finalLogoUrl
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setConfigs({
            ...configs,
            logo_url: finalLogoUrl
          });
          toast.success('Logo图片更新成功');
        } else {
          throw new Error(data.message || '更新失败');
        }
      } else {
        throw new Error('请选择图片或输入URL');
      }
    } catch (error) {
      console.error('更新Logo图片失败:', error);
      toast.error(error instanceof Error ? error.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const addNavItem = async () => {
    try {
      if (!newNavItem.title || !newNavItem.path) {
        toast.error('标题和路径不能为空')
        return
      }

      const response = await fetch('/api/admin/nav', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNavItem)
      })

      const data = await response.json()

      if (data.success) {
        setNavItems([...navItems, data.item])
        setNewNavItem({ title: '', path: '' })
        toast.success('导航项添加成功')
      } else {
        toast.error(data.message || '添加失败')
      }
    } catch (error) {
      console.error('添加导航项失败:', error)
      toast.error('添加失败')
    }
  }

  const updateNavItem = async (id: string, updates: Partial<NavItem>) => {
    try {
      const response = await fetch('/api/admin/nav', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates })
      })

      const data = await response.json()

      if (data.success) {
        setNavItems(navItems.map(item => 
          item.id === id ? data.item : item
        ))
        toast.success('导航项更新成功')
      } else {
        toast.error(data.message || '更新失败')
      }
    } catch (error) {
      console.error('更新导航项失败:', error)
      toast.error('更新失败')
    }
  }

  const deleteNavItem = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/nav?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setNavItems(navItems.filter(item => item.id !== id))
        toast.success(data.message || '导航项删除成功')
      } else {
        toast.error(data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除导航项失败:', error)
      toast.error('删除失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 保存网站标题
      const titleResponse = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'site_title',
          value: siteTitle
        })
      });

      const titleData = await titleResponse.json();
      if (!titleData.success) {
        throw new Error(titleData.message || '保存网站标题失败');
      }

      // 保存网站图标
      const faviconResponse = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'site_favicon',
          value: siteFavicon
        })
      });

      const faviconData = await faviconResponse.json();
      if (!faviconData.success) {
        throw new Error(faviconData.message || '保存网站图标失败');
      }

      // 更新本地状态
      setConfigs({
        ...configs,
        site_title: siteTitle,
        site_favicon: siteFavicon
      });
      
      toast.success('网站设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error(error instanceof Error ? error.message : '保存设置失败');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/config/init', {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('配置初始化成功');
        // 重新加载配置
        fetchData();
      } else {
        throw new Error(data.message || '初始化失败');
      }
    } catch (error) {
      console.error('初始化配置失败:', error);
      toast.error(error instanceof Error ? error.message : '初始化失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">站点设置</h1>

      {/* Logo设置 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Logo 设置</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo名称设置 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Logo 名称
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="输入Logo名称"
              />
              <button
                onClick={updateLogoName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                保存
              </button>
            </div>
          </div>

          {/* Logo图片设置 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Logo 图片
            </label>
            <div className="space-y-4">
              {/* 文件上传 */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              {/* URL输入 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={handleLogoUrlChange}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="或输入Logo URL"
                />
                <button
                  onClick={updateLogoImage}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>

              {/* 预览 */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">预览:</p>
                  <div className="relative w-32 h-32">
                    <Image
                      src={previewUrl}
                      alt="Logo预览"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 导航设置 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">导航设置</h2>
        
        {/* 添加新导航项 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newNavItem.title}
            onChange={(e) => setNewNavItem({ ...newNavItem, title: e.target.value })}
            className="rounded-md border-gray-300"
            placeholder="导航标题"
          />
          <input
            type="text"
            value={newNavItem.path}
            onChange={(e) => setNewNavItem({ ...newNavItem, path: e.target.value })}
            className="rounded-md border-gray-300"
            placeholder="导航路径"
          />
          <button
            onClick={addNavItem}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            添加导航项
          </button>
        </div>

        {/* 导航项列表 */}
        <div className="space-y-4">
          {navItems && navItems.length > 0 ? (
            navItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateNavItem(item.id, { title: e.target.value })}
                    className="rounded-md border-gray-300"
                    placeholder="导航标题"
                  />
                  <input
                    type="text"
                    value={item.path}
                    onChange={(e) => updateNavItem(item.id, { path: e.target.value })}
                    className="rounded-md border-gray-300"
                    placeholder="导航路径"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">排序:</label>
                    <input
                      type="number"
                      value={item.order}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          updateNavItem(item.id, { order: value });
                        }
                      }}
                      className="w-20 rounded-md border-gray-300"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateNavItem(item.id, { isActive: !item.isActive })}
                      className={`flex-1 px-3 py-1 rounded-md ${
                        item.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {item.isActive ? '已启用' : '已禁用'}
                    </button>
                    <button
                      onClick={() => deleteNavItem(item.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      title="删除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无导航项，请添加新的导航项
            </div>
          )}
        </div>
      </div>

      {/* 网站设置 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">网站设置</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  网站标题
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="输入网站标题"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  网站图标URL
                </label>
                <input
                  type="text"
                  value={siteFavicon}
                  onChange={(e) => setSiteFavicon(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="输入网站图标URL"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={initializeConfigs}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? '初始化中...' : '初始化配置'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : '保存设置'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 