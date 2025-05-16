'use client';

import React from 'react';
import Footer from '@/app/ui/sections/Footer';
import Hero from '@/app/ui/sections/Hero';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-700 text-white">
      <main className="flex-grow">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}