'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import CsvImporter from './_components/CsvImporter';
import { Pin, PinOff, ArrowUp, ArrowDown, Trash2, CheckSquare, Square, AlertTriangle, Search } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  createdAt: string;
  views: number;
  isSticky: boolean;
  stickyOrder: number;
  stickyUntil: string | null;
  category: string;
  tags: Array<{ id: string; name: string }>;
  _count: {
    reviews: number;
    favoritedBy: number;
  };
}

interface PaginatedResponse {
  success: boolean;
  data?: {
    games: Game[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasMore: boolean;
    };
  };
  message?: string;
  error?: string;
}

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImporter, setShowImporter] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取游戏列表
  const fetchGames = async (pageNum: number = 1, size: number = pageSize, search: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: size.toString()
      });

      if (search) {
        queryParams.append('search', search);
      }

      const response = await fetch(`/api/admin/games?${queryParams}`);
      if (!response.ok) {
        throw new Error(await response.text() || '加载游戏列表失败');
      }

      const data: PaginatedResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '加载游戏列表失败');
      }

      if (data.data) {
        setGames(data.data.games);
        setTotal(data.data.pagination.total);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
      }

      setSelectedGames([]); // 重置选择状态
      setSelectAll(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载游戏列表失败');
      console.error('加载游戏列表错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取游戏列表
  useEffect(() => {
    fetchGames(currentPage, pageSize);
  }, []);

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchGames(page, pageSize, searchTerm);
  };

  // 处理每页显示数量变化
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 重置到第一页
    fetchGames(1, size, searchTerm);
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 重置到第一页
    fetchGames(1, pageSize, searchTerm);
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) {
      // 如果搜索框被清空，重新加载所有游戏
      fetchGames(1, pageSize);
    }
  };

  // 删除游戏
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个游戏吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/games/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '删除游戏失败');
      }

      // 重新获取当前页游戏列表
      fetchGames(currentPage, pageSize, searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除游戏失败');
      console.error('删除游戏错误:', err);
    }
  };

  // 批量删除游戏
  const handleBatchDelete = async () => {
    if (selectedGames.length === 0) {
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedGames.length} 个游戏吗？此操作不可恢复。`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // 使用Promise.all同时发起多个删除请求
      await Promise.all(
        selectedGames.map(async (id) => {
          const response = await fetch(`/api/admin/games/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`删除游戏 ${id} 失败`);
          }
        })
      );

      // 重新获取当前页游戏列表
      fetchGames(currentPage, pageSize, searchTerm);
      setSelectedGames([]); // 清空选择
      setSelectAll(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量删除游戏失败');
      console.error('批量删除游戏错误:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 切换单个游戏选择状态
  const toggleGameSelection = (id: string) => {
    setSelectedGames(prev => {
      if (prev.includes(id)) {
        return prev.filter(gameId => gameId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 切换全选状态
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedGames([]);
      setSelectAll(false);
    } else {
      setSelectedGames(games.map(game => game.id));
      setSelectAll(true);
    }
  };

  // 检查游戏是否被选中
  const isGameSelected = (id: string) => {
    return selectedGames.includes(id);
  };

  // 每当选中的游戏发生变化，更新全选状态
  useEffect(() => {
    if (games.length > 0 && selectedGames.length === games.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedGames, games]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">游戏管理</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImporter(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              导入游戏
            </button>
            <Link
              href="/admin/games/new"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              新建游戏
            </Link>
          </div>
        </div>

        {/* 搜索和批量操作 */}
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="搜索游戏..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </form>

          <div className="flex items-center gap-4">
            {selectedGames.length > 0 && (
              <button
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? '删除中...' : `删除选中 (${selectedGames.length})`}
              </button>
            )}
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>
                  每页 {size} 条
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertTriangle className="flex-shrink-0" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 游戏列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="flex items-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {selectAll ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  缩略图
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  游戏信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  查看量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    加载中...
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    暂无游戏
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleGameSelection(game.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isGameSelected(game.id) ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={game.thumbnailUrl}
                          alt={game.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/games/${game.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {game.title}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {game._count.reviews} 条评论 · {game._count.favoritedBy} 人收藏
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                        {game.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {game.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(game.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end items-center space-x-2">
                        <Link
                          href={`/admin/games/${game.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!isLoading && games.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, total)}
                  </span>{' '}
                  条，共{' '}
                  <span className="font-medium">{total}</span> 条
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    首页
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  {/* 页码按钮 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 2) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    末页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSV导入器 */}
      {showImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <CsvImporter
              onSuccess={() => {
                setShowImporter(false);
                fetchGames(currentPage, pageSize, searchTerm);
              }}
              onCancel={() => setShowImporter(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}