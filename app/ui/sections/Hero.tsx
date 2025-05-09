'use client';

import LoginForm from '@/app/ui/login-form';

export default function Hero() {  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Unleash Your <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Creative Potential</span>
            </h1>
            <p className='text-xl mb-8 text-gray-300'>
              The all-in-one platform for writers to create, publish, and monetize their work with powerful AI assistance.
            </p>
          </div>
          <div className="md:w-1/2">
            <div className='rounded-2xl shadow-xl overflow-hidden bg-gray-800'>
              <div className='p-1 bg-gray-200'>
                <div className="flex space-x-2 px-3 py-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="p-6">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}