'use client';

import { Mail, Lock, User } from 'lucide-react';
import { authenticate, registerUser } from '@/app/lib/actions/auth';
import { useActionState, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';


export default function LoginForm() {
    const [activeTab, setActiveTab] = useState('login');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const router = useRouter();
    
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    
    // Login action state
    const [loginErrorMessage, loginFormAction, isLoginPending] = useActionState(
      authenticate,
      undefined,
    );
    
    const [registerErrorMessage, registerFormAction, isRegisterPending] = useActionState(
      registerUser,
      undefined,
    );

    return (
        <div className='bg-gray-900 rounded-lg p-6'>
        {/* Form Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'login' 
              ? `border-b-2 border-myred-500 text-myred-500` 
              : 'text-gray-400'}`}
            onClick={() => setActiveTab('login')}
          >
            Log In
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'signup' 
                ? `border-b-2 border-myred-500 text-myred-500` 
                : 'text-gray-400'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
        
        {/* Login Error Message */}
        {activeTab === 'login' && loginErrorMessage && (
          <div className="bg-myred-500 text-white p-3 rounded-md mb-4">
            {loginErrorMessage}
          </div>
        )}
        
        {/* Register Error Message */}
        {activeTab === 'signup' && registerErrorMessage && (
          <div className="bg-myred-500 text-white p-3 rounded-md mb-4">
            {registerErrorMessage}
          </div>
        )}
        
        {/* Login Form */}
        {activeTab === 'login' && (
          <form action={loginFormAction} className="space-y-4">
            <div>
              <label className='block mb-2 font-medium text-gray-300' htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail size={18} className='text-gray-500' />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className='pl-10 w-full p-2.5 rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-myred-500 focus:border-myred-500 border'
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className='block mb-2 font-medium text-gray-300' htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={18} className='text-gray-500' />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className='pl-10 w-full p-2.5 rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-myred-500 focus:border-myred-500 border'
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border rounded focus:ring-3 focus:ring-myred-300 bg-gray-700 border-gray-600"
                />
                <label htmlFor="remember" className='ml-2 text-sm text-gray-300'>
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-myred-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            <button
              type="submit"
              className="w-full py-2.5 px-5 text-white bg-myred-600 rounded-lg hover:bg-myred-700 focus:ring-4 focus:ring-myred-300 font-medium"
              disabled={isLoginPending}
            >
              {isLoginPending ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        )}
        
        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form action={registerFormAction} className="space-y-4">
            {/* First Name and Last Name fields side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className='block mb-2 font-medium text-gray-300' htmlFor="firstName">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User size={18} className='text-gray-500' />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName" 
                    className='pl-10 w-full p-2.5 rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-myred-500 focus:border-myred-500 border'
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className='block mb-2 font-medium text-gray-300' htmlFor="lastName">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User size={18} className='text-gray-500' />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className='pl-10 w-full p-2.5 rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-myred-500 focus:border-myred-500 border'
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className='block mb-2 font-medium text-gray-300' htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail size={18} className='text-gray-500'/>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className='pl-10 w-full p-2.5 rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-myred-500 focus:border-myred-500 border'
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className='block mb-2 font-medium text-gray-300' htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={18} className='text-gray-500'/>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password" 
                  className='pl-10 w-full p-2.5 rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-myred-500 focus:border-myred-500 border'
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </p>
            </div>
            <div className="flex items-start mb-4">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  value="accepted"
                  name="terms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 border rounded focus:ring-3 focus:ring-myred-300 bg-gray-700 border-gray-600"
                  required
                />
              </div>
              <label htmlFor="terms" className='ml-2 text-sm text-gray-300'>
                By signing up, you agree to our{' '}
                <a href="#" className="text-myred-500 hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-myred-500 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            <button
              type="submit"
              className={`w-full py-2.5 px-5 text-white rounded-lg font-medium ${
                termsAgreed 
                  ? 'bg-myred-600 hover:bg-myred-700 focus:ring-4 focus:ring-myred-300' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!termsAgreed || isRegisterPending}
            >
              {isRegisterPending ? 'Creating account...' : 'Create an account'}
            </button>
          </form>
        )}
      </div>
    );
}