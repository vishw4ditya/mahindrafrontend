'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut, User, LayoutDashboard, Users, MapPin, 
  Settings, Bell, Search, Menu, Github, Youtube, 
  Database, ShieldCheck 
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const sidebarItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Home', active: true },
    { icon: <Users size={22} />, label: 'Network' },
    { icon: <MapPin size={22} />, label: 'Territories' },
    { icon: <Bell size={22} />, label: 'Notifications' },
    { icon: <Settings size={22} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top Navbar (FB/GitHub Mix) */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50 px-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-accent p-1.5 rounded-lg text-white">
              <Database size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:block">CollectionPro</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition" size={18} />
            <input 
              type="text" 
              placeholder="Search records, users, or locations..." 
              className="w-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent rounded-full py-2 pl-10 pr-4 outline-none transition"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center px-3 py-1 bg-green-50 border border-green-100 rounded-full text-green-700 text-xs font-bold space-x-1">
            <ShieldCheck size={14} />
            <span>{user.status || 'Verified'}</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2 group cursor-pointer p-1 rounded-full hover:bg-gray-100 transition relative">
             <div className="w-8 h-8 rounded-full bg-gh-dark flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm overflow-hidden">
                <User size={18} />
             </div>
             <span className="text-sm font-semibold hidden lg:block">{user.name.split(' ')[0]}</span>
             {/* Profile Tooltip */}
             <div className="hidden group-hover:block absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 whitespace-nowrap z-50">
               <p className="text-xs text-gray-500 mb-2">ID: <span className="font-mono font-bold text-gray-900">{user.staticId || 'N/A'}</span></p>
               <p className="text-xs text-gray-500 mb-2">Role: <span className="font-bold text-gray-900">{user.role}</span></p>
               <p className="text-xs text-gray-500">Status: <span className="font-bold text-green-600">{user.status}</span></p>
             </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (YouTube Inspired) */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-r border-gray-200 overflow-y-auto hidden md:block flex-shrink-0"
            >
              <div className="p-4 space-y-1">
                {sidebarItems.map((item, idx) => (
                  <button 
                    key={idx}
                    className={`yt-sidebar-item w-full space-x-4 ${item.active ? 'bg-gray-100 text-accent font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className={item.active ? 'text-accent' : 'text-gray-500'}>{item.icon}</span>
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 mt-4">
                 <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h3>
                 <button 
                   onClick={logout}
                   className="yt-sidebar-item w-full space-x-4 text-red-600 hover:bg-red-50"
                 >
                    <LogOut size={22} />
                    <span className="text-sm font-bold">Sign Out</span>
                 </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           <div className="max-w-6xl mx-auto">
              {/* User ID Card - Prominently display static ID */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
                      <p className="text-gray-600 font-medium">{user.role}</p>
                      <p className="text-sm text-gray-500 mt-1">{user.zone} {user.branch ? `/ ${user.branch}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl px-4 py-3 border border-blue-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Static ID</p>
                      <p className="text-lg font-black text-blue-600 font-mono tracking-wider">{user.staticId || 'N/A'}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-200">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                      <p className="text-lg font-black text-green-600">{user.status || 'Verified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breadcrumbs / Page Header */}
              <div className="mb-8">
                 <h1 className="text-2xl font-extrabold tracking-tight text-[#1c1e21]">{user.role} Dashboard</h1>
                 <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
              </div>

              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
