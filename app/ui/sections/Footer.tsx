'use client';

import Link from 'next/link';
import TiktokIcon from '../icons/tiktok';
import InstagramIcon from '../icons/instagram';
import XIcon from '../icons/x-twitter';

export default function Footer() {
    return (
        <footer className='mt-auto py-12 bg-gray-900 text-gray-300 border-t border-gray-800 w-full'>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo and Company Description */}
                    <div className="lg:col-span-2">
                        <div className='flex items-center mb-6'>
                            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">The Boring Platform</span>
                        </div>
                        <p className="mb-6 text-gray-400 max-w-md">
                            Write with AI. Publish on-chain. Own it.
                        </p>
                        <div className="flex space-x-5">
                            <Link href="https://x.com/aboringplatform" className="text-gray-400 hover:text-myred-500 transition-colors" aria-label="Twitter">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <XIcon />
                                </div>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors" aria-label="Instagram">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <InstagramIcon />
                                </div>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors" aria-label="Facebook">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <TiktokIcon />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors">About</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-myred-500 transition-colors">Cookie Policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500">&copy; {new Date().getFullYear()} The Boring Platform. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}