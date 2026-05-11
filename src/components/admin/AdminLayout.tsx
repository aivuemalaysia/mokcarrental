'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  theme: 'light',
  toggleTheme: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    }

    const savedTheme = localStorage.getItem('adminTheme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('adminTheme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, theme, toggleTheme }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

function AdminSidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [activeItem, setActiveItem] = useState('dashboard');
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    if (pathname.includes('/admin/dashboard')) setActiveItem('dashboard');
    else if (pathname.includes('/admin/cars')) setActiveItem('cars');
    else if (pathname.includes('/admin/inquiries')) setActiveItem('inquiries');
    else if (pathname.includes('/admin/branding')) setActiveItem('branding');
    else if (pathname.includes('/admin/settings')) setActiveItem('settings');
  }, [pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { id: 'cars', label: 'Car Fleet', href: '/admin/cars', icon: '🚗' },
    { id: 'inquiries', label: 'Inquiries', href: '/admin/inquiries', icon: '📋' },
    { id: 'branding', label: 'Branding', href: '/admin/branding', icon: '🎨' },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white transition-all duration-300 z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gold-400">Mok Admin</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-2 p-2 hover:bg-gray-700 rounded-lg transition-colors w-full flex items-center justify-center"
          >
            {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeItem === item.id
                  ? 'bg-gold-500 text-white shadow-lg'
                  : 'hover:bg-gray-700 text-gray-300'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

function AdminHeader() {
  const { isCollapsed, theme, toggleTheme } = useSidebar();
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@mokcarrental.com' });
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      setAdminUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {adminUser.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your car rental business</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold">
              {adminUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
