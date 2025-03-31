import Link from 'next/link';

const AdminSidebar = () => {
  return (
    <div>
      {/* 将 <Link href="/admin/dashboard">仪表盘</Link> 改为 <Link href="/admin">仪表盘</Link> */}
      <Link href="/admin">仪表盘</Link>
    </div>
  );
};

export default AdminSidebar; 