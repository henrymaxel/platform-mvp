//app/ui/dashboard/mobilenav.tsx
'use client';

import React, { useState } from 'react';
import { Home, Edit, BookOpen, Settings, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutAction } from '@/app/lib/actions/actions';

const links = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Writing Studio', href: '/dashboard/studio', icon: Edit },
  { name: 'Reading Library', href: '/dashboard/reading', icon: BookOpen },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation Panel */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-myred-500">Company A</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="space-y-2 flex-1">
              {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href || 
                               (link.href !== '/dashboard' && pathname.startsWith(link.href));
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleNavClick}
                    className={clsx(
                      'flex items-center w-full p-3 rounded-md transition-colors',
                      {
                        'bg-myred-500 hover:bg-myred-600 text-white': isActive,
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
                onClick={handleNavClick}
                className={clsx(
                  'flex items-center w-full p-3 rounded-md transition-colors',
                  {
                    'bg-myred-500 hover:bg-myred-600 text-white': pathname === '/dashboard/settings',
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
          </div>
        </div>
      )}
    </>
  );
}