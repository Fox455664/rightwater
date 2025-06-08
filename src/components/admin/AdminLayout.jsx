// src/components/admin/AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-4">لوحة التحكم</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/admin/orders" className="hover:underline">إدارة الطلبات</Link>
          <Link to="/admin/products" className="hover:underline">إدارة المنتجات</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
