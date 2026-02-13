'use client';

import Link from 'next/link';
import { ShieldCheck, Users, MapPin, Database, ArrowRight, Github, Youtube, Instagram, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const steps = [
    {
      title: "1. Registration",
      description: "Users register with their role, zone, and branch. A unique Static ID is generated for security.",
      icon: <Users className="text-blue-500" size={32} />,
      color: "border-blue-200 bg-blue-50"
    },
    {
      title: "2. Owner Verification",
      description: "Owner reviews all pending registrations. Only verified users can access their dashboards.",
      icon: <ShieldCheck className="text-green-500" size={32} />,
      color: "border-green-200 bg-green-50"
    },
    {
      title: "3. Role-Based Access",
      description: "Users login to personalized dashboards based on their specific organizational roles.",
      icon: <Database className="text-purple-500" size={32} />,
      color: "border-purple-200 bg-purple-50"
    },
    {
      title: "4. Data Collection",
      description: "Salesmen and Technicians collect field data with automatic live location fetching.",
      icon: <MapPin className="text-red-500" size={32} />,
      color: "border-red-200 bg-red-50"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1c1e21]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-morphism px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-accent p-2 rounded-lg text-white">
            <Database size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">CollectionPro</span>
        </div>
        <div className="hidden md:flex space-x-8 font-medium">
          <a href="#flow" className="hover:text-accent transition">Flow</a>
          <a href="#features" className="hover:text-accent transition">Features</a>
          <a href="#about" className="hover:text-accent transition">About</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-4 py-2 font-semibold hover:bg-gray-200 rounded-lg transition">Log In</Link>
          <Link href="/register" className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition shadow-md">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Manage your field operations <br />
            <span className="text-accent">with social precision.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            A powerful blend of social connectivity and professional data management. 
            Inspired by the best of <span className="text-blue-600 font-bold">FB</span>, 
            <span className="text-pink-600 font-bold"> IG</span>, 
            <span className="text-gray-900 font-bold"> GitHub</span>, and 
            <span className="text-red-600 font-bold"> YouTube</span>.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-accent text-white font-bold rounded-xl text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center">
              Start Free Trial <ArrowRight className="ml-2" size={20} />
            </Link>
            <div className="flex items-center space-x-4 text-gray-500">
              <Github size={24} className="hover:text-black cursor-pointer" />
              <Youtube size={24} className="hover:text-red-600 cursor-pointer" />
              <Instagram size={24} className="hover:text-pink-600 cursor-pointer" />
              <Facebook size={24} className="hover:text-blue-600 cursor-pointer" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Site Flow Section */}
      <section id="flow" className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
            <div className="h-1.5 w-24 bg-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-2xl border-2 ${step.color} shadow-sm transition-all`}
              >
                <div className="mb-6">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section (GitHub/YT inspired) */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Built for clarity. <br />Designed for speed.</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our dashboards take the clean sidebar navigation of YouTube, the structured 
              data presentation of GitHub, and the intuitive feed-style updates of Facebook.
            </p>
            <ul className="space-y-4">
              {['Role-based Dynamic Views', 'Live Geolocation Tracking', 'Verified-only Access', 'Instant Excel/CSV Export'].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-gray-700 font-medium">
                  <div className="bg-green-100 p-1 rounded-full text-green-600">
                    <ShieldCheck size={18} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="gh-card p-4 shadow-2xl rounded-xl overflow-hidden bg-white">
             <div className="flex items-center space-x-2 mb-4 p-2 border-b">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="text-xs text-gray-400 ml-4 font-mono">dashboard_preview.tsx</div>
             </div>
             <div className="space-y-4 p-4">
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-20 bg-gray-50 rounded animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-blue-50 rounded animate-pulse"></div>
                  <div className="h-32 bg-green-50 rounded animate-pulse"></div>
                  <div className="h-32 bg-purple-50 rounded animate-pulse"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gh-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <Database size={24} className="text-accent" />
            <span className="text-2xl font-bold">CollectionPro</span>
          </div>
          <div className="flex space-x-8 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact Support</a>
          </div>
          <p className="mt-8 md:mt-0 text-gray-500 text-sm">© 2026 CollectionPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
