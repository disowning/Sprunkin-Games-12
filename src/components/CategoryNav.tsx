'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function CategoryNav({ categories }: { categories: any[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-4">
      <Link
        href="/"
        className={`px-4 py-2 rounded-full ${
          pathname === '/'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        全部
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className={`px-4 py-2 rounded-full ${
            pathname === `/categories/${category.slug}`
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
} 