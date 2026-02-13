'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, User, Mail, Phone, Lock, Map, Briefcase } from 'lucide-react';

const roles = ['Regional Manager', 'Manager', 'Salesman', 'Technician'];
const zones = ['Zone A', 'Zone B'];
const branches = ['Branch 1', 'Branch 2', 'Branch 3', 'Branch 4', 'Branch 5', 'Branch 6'];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    role: 'Salesman',
    zone: 'Zone A',
    branch: 'Branch 1',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      setMessage(`Registration successful! Static ID: ${res.data.staticId}. Wait for Owner verification.`);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-accent rounded-2xl text-white mb-4 shadow-lg">
            <Database size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1c1e21] tracking-tight">Join CollectionPro</h2>
          <p className="text-gray-500 mt-2">Create your professional account</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="relative md:col-span-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="relative md:col-span-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition appearance-none"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                >
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              {formData.role !== 'Regional Manager' && (
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition appearance-none"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  >
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 text-center font-medium"
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Register</span>
              )}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-accent hover:underline text-sm font-medium">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
