'use client';

import { useState } from 'react';
import { UploadCloud, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  results?: {
    total: number;
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  };
}

// 添加组件属性接口
interface CsvImporterProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CsvImporter({ onSuccess, onCancel }: CsvImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else if (selectedFile) {
      setFile(null);
      setResult({
        success: false,
        message: '请上传CSV格式的文件'
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/games/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      
      // 如果导入成功，调用成功回调
      if (data.success && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500); // 短暂延迟以便用户看到成功信息
      }
    } catch (error) {
      setResult({
        success: false,
        message: '导入失败，请稍后重试'
      });
      console.error('导入错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    // 成功后，用户可能想重新上传，不需要关闭窗口
  };

  const handleDownloadTemplate = () => {
    // CSV模板内容
    const templateContent = `title,description,thumbnailUrl,gameUrl,instructions,categories,tags,slug
游戏名称示例,游戏描述示例,https://example.com/image.jpg,https://example.com/game,游戏说明示例,动作,热门,game-name-example`;

    // 创建Blob对象
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 创建临时链接并点击下载
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '游戏导入模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">CSV批量导入游戏</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          上传CSV文件批量导入游戏数据
        </p>
      </div>

      <div className="space-y-4">
        {!result?.success && (
          <>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                id="csv-file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              
              <label
                htmlFor="csv-file"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <UploadCloud className="h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {file ? file.name : '点击选择CSV文件'}
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  CSV文件大小不超过10MB
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '导入中...' : '开始导入'}
              </button>
              
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                下载CSV模板
              </button>

              <button
                type="button"
                onClick={() => setShowTemplate(!showTemplate)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm underline focus:outline-none"
              >
                {showTemplate ? '隐藏CSV格式说明' : '查看CSV格式说明'}
              </button>
              
              <button
                type="button"
                onClick={() => onCancel && onCancel()}
                className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                取消
              </button>
            </div>
          </>
        )}

        {showTemplate && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-4 mt-4">
            <h3 className="text-sm font-medium mb-2">CSV文件格式说明：</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 pl-5 list-disc">
              <li><strong>title</strong> (必填): 游戏标题</li>
              <li><strong>description</strong> (必填): 游戏描述</li>
              <li><strong>thumbnailUrl</strong> (必填): 缩略图URL地址</li>
              <li><strong>gameUrl</strong> (必填): 游戏链接</li>
              <li><strong>instructions</strong> (选填): 游戏说明</li>
              <li><strong>categories</strong> (选填): 游戏分类，多个分类用逗号分隔</li>
              <li><strong>tags</strong> (选填): 游戏标签，多个标签用逗号分隔</li>
              <li><strong>slug</strong> (选填): URL标识，不填则自动根据标题生成</li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              注意：分类和标签必须是系统中已存在的，否则将被忽略
            </p>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {result.message}
                </h3>
                
                {result.results && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      总计: {result.results.total} | 
                      成功: {result.results.success} | 
                      失败: {result.results.failed}
                    </p>
                    
                    {result.results.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-red-700 dark:text-red-300">错误详情:</p>
                        <ul className="mt-1 pl-5 list-disc space-y-1 text-red-700 dark:text-red-300">
                          {result.results.errors.map((err, idx) => (
                            <li key={idx}>
                              第 {err.row} 行: {err.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                重新上传
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 