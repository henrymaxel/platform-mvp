//app/ui/dashboard/navlinks.tsx
'use client';

import {
  Home,
  Edit,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutAction } from '@/app/lib/actions';

// Map of links to display in the side navigation.
const links = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Writing Studio', href: '/dashboard/studio', icon: Edit },
  { name: 'Reading Library', href: '/dashboard/reading', icon: BookOpen },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href || 
                          (link.href !== '/dashboard' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex items-center w-full p-3 rounded-md transition-colors',
                {
                  'bg-red-500 hover:bg-red-600 text-white': isActive,
                  'text-gray-300 hover:bg-gray-700': !isActive,
                },
              )}
            >
              <LinkIcon size={20} />
              <span className="ml-3">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="space-y-2 pt-4">
        <Link
          href="/dashboard/settings"
          className={clsx(
            'flex items-center w-full p-3 rounded-md transition-colors',
            {
              'bg-red-500 hover:bg-red-600 text-white': pathname === '/dashboard/settings',
              'text-gray-300 hover:bg-gray-700': pathname !== '/dashboard/settings',
            }
          )}
        >
          <Settings size={20} />
          <span className="ml-3">Settings</span>
        </Link>
        
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center w-full p-3 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Sign Out</span>
          </button>
        </form>
      </div>
    </>
  );
}