'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Globe, Trash2, Plus, ArrowLeft, Info, ExternalLink, RefreshCw, Check, X, AlertTriangle, Copy, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
}

interface DomainStatus {
  id: string;
  isChecking: boolean;
  status?: 'valid' | 'invalid' | 'error';
}

interface ProxyConfig {
  port: number;
  ssl: boolean;
  customHeaders?: Record<string, string>;
}

export default function DomainsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [domainStatuses, setDomainStatuses] = useState<Record<string, DomainStatus>>({});
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showProxyConfig, setShowProxyConfig] = useState<string | null>(null);
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>({
    port: 3000,
    ssl: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchDomains();
    }
  }, [status, session, router]);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/admin/domains');
      if (!response.ok) throw new Error('Failed to fetch domains');
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      toast.error('加载域名列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清理输入
    const domainToAdd = newDomain.trim();
    
    if (!domainToAdd) {
      toast.error('请输入域名');
      return;
    }

    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToAdd }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 显示具体的错误信息
        toast.error(data.error || '添加域名失败');
        return;
      }

      setDomains([data, ...domains]);
      setNewDomain('');
      toast.success('域名添加成功');
    } catch (error) {
      console.error('添加域名错误:', error);
      toast.error('添加域名失败，请检查网络连接');
    }
  };

  // 添加域名输入框的即时验证
  const validateDomain = (value: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(value.trim());
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('确定要删除这个域名吗？')) return;

    try {
      const response = await fetch(`/api/admin/domains/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete domain');

      setDomains(domains.filter(domain => domain.id !== id));
      toast.success('域名删除成功');
    } catch (error) {
      toast.error('删除域名失败');
      console.error(error);
    }
  };

  const handleToggleDomain = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/domains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update domain status');

      setDomains(domains.map(domain => 
        domain.id === id ? { ...domain, isActive: !currentStatus } : domain
      ));
      toast.success('域名状态更新成功');
    } catch (error) {
      toast.error('更新域名状态失败');
      console.error(error);
    }
  };

  // 检查域名状态
  const checkDomainStatus = async (domainId: string) => {
    setDomainStatuses(prev => ({
      ...prev,
      [domainId]: { id: domainId, isChecking: true }
    }));

    try {
      const response = await fetch(`/api/admin/domains/check/${domainId}`);
      const data = await response.json();

      setDomainStatuses(prev => ({
        ...prev,
        [domainId]: { 
          id: domainId, 
          isChecking: false,
          status: data.status
        }
      }));

      if (data.status === 'valid') {
        toast.success('域名配置正确');
      } else {
        toast.error('域名配置有误，请检查DNS设置');
      }
    } catch (error) {
      console.error('检查域名状态失败:', error);
      toast.error('检查域名状态失败');
      setDomainStatuses(prev => ({
        ...prev,
        [domainId]: { 
          id: domainId, 
          isChecking: false,
          status: 'error'
        }
      }));
    }
  };

  // 复制DNS配置信息
  const copyDnsConfig = () => {
    const config = `
记录类型: CNAME
主机记录: @
记录值: your-site.vercel.app

记录类型: CNAME
主机记录: www
记录值: your-site.vercel.app
    `.trim();

    navigator.clipboard.writeText(config)
      .then(() => toast.success('DNS配置已复制到剪贴板'))
      .catch(() => toast.error('复制失败，请手动复制'));
  };

  // 添加配置表单
  const ProxyConfigForm = ({ selectedDomain }: { selectedDomain: Domain | null }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">反向代理配置</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            应用端口
          </label>
          <input
            type="number"
            value={proxyConfig.port}
            onChange={(e) => setProxyConfig({
              ...proxyConfig,
              port: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={proxyConfig.ssl}
              onChange={(e) => setProxyConfig({
                ...proxyConfig,
                ssl: e.target.checked
              })}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">启用 SSL</span>
          </label>
        </div>

        {selectedDomain && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">生成的 Nginx 配置</h4>
            <pre className="text-xs bg-gray-800 text-white p-4 rounded overflow-x-auto">
              {`server {
    listen ${proxyConfig.ssl ? '443 ssl' : '80'};
    server_name ${selectedDomain.domain};
    
    ${proxyConfig.ssl ? `
    ssl_certificate /etc/letsencrypt/live/${selectedDomain.domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${selectedDomain.domain}/privkey.pem;
    ` : ''}
    location / {
      proxy_pass http://localhost:${proxyConfig.port};
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">域名管理</h1>
        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
        >
          <ArrowLeft size={18} />
          <span>返回仪表盘</span>
        </Link>
      </div>

      {/* 域名使用说明 - 增强版 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-800">
            <Info size={20} />
            域名绑定使用说明
          </h2>
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <Settings size={16} />
            {showTroubleshooting ? '隐藏故障排除' : '显示故障排除'}
          </button>
        </div>

        {/* DNS设置说明 */}
        <div className="space-y-4 text-blue-700">
          <div>
            <h3 className="font-medium mb-2">第一步：添加域名</h3>
            <p className="text-sm">
              在下方输入框中添加您要绑定的域名（例如：games.yourdomain.com）。
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">第二步：DNS解析设置</h3>
            <div className="bg-white bg-opacity-50 rounded p-4 space-y-2">
              <p className="text-sm font-medium">请在您的域名管理面板中添加以下DNS记录：</p>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2">记录类型</th>
                    <th className="text-left py-2">主机记录</th>
                    <th className="text-left py-2">记录值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">CNAME</td>
                    <td className="py-2">@</td>
                    <td className="py-2">your-site.vercel.app</td>
                  </tr>
                  {/* 如果需要支持www子域名 */}
                  <tr>
                    <td className="py-2">CNAME</td>
                    <td className="py-2">www</td>
                    <td className="py-2">your-site.vercel.app</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">第三步：等待生效</h3>
            <p className="text-sm">
              DNS解析通常需要几分钟到48小时不等的时间来生效。您可以使用
              <a 
                href="https://www.whatsmydns.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 mx-1"
              >
                DNS检查工具
                <ExternalLink size={14} />
              </a>
              来验证解析是否已经生效。
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">注意事项：</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>确保域名已经在域名注册商处完成实名认证</li>
              <li>如果使用CDN，请确保CDN配置正确</li>
              <li>SSL证书会自动配置，无需手动设置</li>
              <li>如遇问题，请检查DNS解析是否正确配置</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>提示：</strong> 域名绑定成功后，您的游戏站点将可以通过新域名访问。请确保在绑定域名后及时更新相关链接和引用。
            </p>
          </div>

          {/* DNS设置截图 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">阿里云DNS设置示例</h4>
              <Image
                src="/images/dns-aliyun.png"
                alt="阿里云DNS设置示例"
                width={400}
                height={200}
                className="rounded border border-gray-200"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2">腾讯云DNS设置示例</h4>
              <Image
                src="/images/dns-tencent.png"
                alt="腾讯云DNS设置示例"
                width={400}
                height={200}
                className="rounded border border-gray-200"
              />
            </div>
          </div>

          {/* 快速复制DNS配置 */}
          <div className="mt-4">
            <button
              onClick={copyDnsConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
            >
              <Copy size={16} />
              复制DNS配置信息
            </button>
          </div>

          {/* 故障排除指南 */}
          {showTroubleshooting && (
            <div className="mt-6 bg-white bg-opacity-50 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-4">常见问题排除指南</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. DNS解析未生效</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>确认DNS记录已正确添加</li>
                    <li>等待DNS缓存刷新（通常需要几分钟到几小时）</li>
                    <li>使用 nslookup 或 dig 命令检查DNS解析</li>
                    <li>清除浏览器DNS缓存</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">2. SSL证书问题</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>确保域名已正确解析到服务器</li>
                    <li>等待SSL证书自动颁发（最多24小时）</li>
                    <li>检查是否存在CAA记录限制</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">3. 网站无法访问</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>确认域名状态是否正常</li>
                    <li>检查域名是否备案（中国大陆要求）</li>
                    <li>验证服务器防火墙设置</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
                  <h4 className="font-medium mb-2 text-yellow-800">故障排除工具</h4>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="https://www.whatsmydns.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        DNS传播检查
                        <ExternalLink size={14} />
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://www.ssllabs.com/ssltest/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        SSL证书检查
                        <ExternalLink size={14} />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 在使用说明中添加反代配置部分 */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">反向代理配置说明</h3>
            <div className="space-y-2 text-sm">
              <p>如果您在同一服务器上运行多个网站，需要配置反向代理：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>安装 Nginx：
                  <pre className="bg-gray-800 text-white p-2 rounded mt-1">
                    sudo apt update && sudo apt install nginx
                  </pre>
                </li>
                <li>创建 Nginx 配置文件：
                  <pre className="bg-gray-800 text-white p-2 rounded mt-1">
                    sudo nano /etc/nginx/conf.d/your-domain.conf
                  </pre>
                </li>
                <li>复制生成的 Nginx 配置到文件中</li>
                <li>测试配置：
                  <pre className="bg-gray-800 text-white p-2 rounded mt-1">
                    sudo nginx -t
                  </pre>
                </li>
                <li>重启 Nginx：
                  <pre className="bg-gray-800 text-white p-2 rounded mt-1">
                    sudo systemctl restart nginx
                  </pre>
                </li>
              </ol>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4">
              <h4 className="font-medium text-yellow-800 mb-2">注意事项：</h4>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                <li>确保每个网站使用不同的端口</li>
                <li>配置 SSL 证书时需要使用 certbot</li>
                <li>检查防火墙设置是否允许 80/443 端口</li>
                <li>定期备份 Nginx 配置文件</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 添加新域名 */}
      <form onSubmit={handleAddDomain} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="输入要绑定的域名，例如: example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                newDomain && !validateDomain(newDomain) ? 'border-red-500' : ''
              }`}
            />
            {newDomain && !validateDomain(newDomain) && (
              <p className="mt-1 text-sm text-red-500">
                请输入有效的域名格式，例如: example.com
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!newDomain || !validateDomain(newDomain)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            <span>添加域名</span>
          </button>
        </div>
      </form>

      {/* 域名列表 - 增强版 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">域名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNS检查</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">添加时间</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domains.map((domain) => (
              <tr key={domain.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Globe size={18} className="text-gray-400 mr-2" />
                    <span>{domain.domain}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleDomain(domain.id, domain.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      domain.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {domain.isActive ? '已启用' : '已禁用'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => checkDomainStatus(domain.id)}
                    className="flex items-center gap-2 text-sm"
                    disabled={domainStatuses[domain.id]?.isChecking}
                  >
                    {domainStatuses[domain.id]?.isChecking ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : domainStatuses[domain.id]?.status === 'valid' ? (
                      <Check size={16} className="text-green-500" />
                    ) : domainStatuses[domain.id]?.status === 'invalid' ? (
                      <X size={16} className="text-red-500" />
                    ) : domainStatuses[domain.id]?.status === 'error' ? (
                      <AlertTriangle size={16} className="text-yellow-500" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    {domainStatuses[domain.id]?.isChecking ? '检查中...' : '检查DNS'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(domain.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setShowProxyConfig(domain.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 反向代理配置表单 */}
      {showProxyConfig && (
        <ProxyConfigForm selectedDomain={domains.find(d => d.id === showProxyConfig) || null} />
      )}
    </div>
  );
} 