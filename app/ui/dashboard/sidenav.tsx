//app/ui/dashboard/sidenav.tsx
'use client';

import React from 'react';
import NavLinks from '@/app/ui/dashboard/navlinks';

export default function SideNav() {
  return (
    <div className="w-64 bg-gray-800 p-4 flex-shrink-0 flex flex-col h-full">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-2xl font-bold text-myred-500">
          The Boring Platform
        </h1>
      </div>
      
      <NavLinks />
    </div>
  );
}