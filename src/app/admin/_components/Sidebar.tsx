import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <Link
      href="/admin/seo"
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
    >
      <Settings size={18} />
      <span>SEO 设置</span>
    </Link>
  );
} 