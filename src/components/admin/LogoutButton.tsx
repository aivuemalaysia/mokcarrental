'use client';

import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';

type Props = {
  authenticated: boolean;
  redirectTo?: string;
  confirm?: boolean;
  confirmMessage?: string;
  className?: string;
};

export default function LogoutButton({
  authenticated,
  redirectTo = '/admin/login',
  confirm = true,
  confirmMessage = 'Log out?',
  className = '',
}: Props) {
  const router = useRouter();

  if (!authenticated) return null;

  const handleLogout = async () => {
    if (confirm && typeof window !== 'undefined') {
      const ok = window.confirm(confirmMessage);
      if (!ok) return;
    }

    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('adminUser');
    localStorage.removeItem('accessToken');
    router.replace(redirectTo);
  };

  return (
    <button
      type="button"
      aria-label="Logout"
      onClick={handleLogout}
      className={`p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 active:scale-95 ${className}`}
      title="Logout"
    >
      <FiLogOut size={20} />
    </button>
  );
}

