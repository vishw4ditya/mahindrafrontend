'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, MapPin, Download, Search, Users, Calendar, Phone, Package, ArrowRight, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from './LocationMap';

export default function SalesmanDashboard() {
  const [customers, setCustomers] = useState<Array<{_id: string; name: string; phone: string; productModel: string; location?: {address?: string; lat?: number; lng?: number; town?: string; district?: string}; lastVisitDate: string; nextVisitDate: string}>>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat?: number; lng?: number; address?: string; town?: string; district?: string} | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    productModel: '',
    lastVisitDate: '',
    nextVisitDate: '',
    location: { lat: 0, lng: 0, address: '' }
  });
  const [editingCustomer, setEditingCustomer] = useState<{
    _id?: string;
    name: string;
    phone: string;
    productModel: string;
    lastVisitDate: string;
    nextVisitDate: string;
    location?: { lat: number; lng: number; address: string; town?: string; district?: string };
  } | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          }
        });
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setShowForm(false);
      fetchCustomers();
      setFormData({
        name: '', phone: '', productModel: '', lastVisitDate: '', nextVisitDate: '',
        location: { lat: 0, lng: 0, address: '' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const exportData = () => {
    const dataToExport = customers.map(c => ({
      Name: c.name,
      Phone: c.phone,
      Model: c.productModel,
      Location: c.location?.address,
      LastVisit: c.lastVisitDate,
      NextVisit: c.nextVisitDate
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "My_Customers.xlsx");
  };

  const handleEdit = (customer: {_id: string; name: string; phone: string; productModel: string; lastVisitDate: string; nextVisitDate: string; location?: {address?: string; lat?: number; lng?: number; town?: string; district?: string}}) => {
    setEditingCustomer({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      productModel: customer.productModel,
      lastVisitDate: customer.lastVisitDate?.split('T')[0] || '',
      nextVisitDate: customer.nextVisitDate?.split('T')[0] || '',
      location: customer.location ? {
        lat: customer.location.lat || 0,
        lng: customer.location.lng || 0,
        address: customer.location.address || ''
      } : { lat: 0, lng: 0, address: '' }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?._id) return;

    try {
      await api.put(`/customers/${editingCustomer._id}`, editingCustomer);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.productModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Stats (GitHub/FB Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c1e21]">My Customers</h1>
          <p className="text-gray-500 text-sm font-medium">Manage and track your customer visits</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
          >
            <Download size={18} />
            <span>Export Data</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-accent text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-md shadow-blue-200 font-bold text-sm"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Stats Row (GitHub Style Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', count: customers.length, icon: <Users className="text-blue-500" />, color: 'border-blue-200' },
          { label: 'Visits Today', count: 0, icon: <Calendar className="text-orange-500" />, color: 'border-orange-200' },
          { label: 'Active Leads', count: customers.length, icon: <Package className="text-green-500" />, color: 'border-green-200' },
          { label: 'Pending Follow-ups', count: 0, icon: <Phone className="text-purple-500" />, color: 'border-purple-200' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-5 rounded-2xl border-b-4 ${stat.color} shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1">{stat.count}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Search Bar (FB Style) */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, phone or product model..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customer Feed (FB/Instagram Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.map((c) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={c._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors">{c.name}</h3>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Phone size={12} /> {c.phone}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-gray-100">
                    ID: {c._id.slice(-6)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <Package size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Model</p>
                      <p className="text-sm font-bold text-gray-700">{c.productModel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <MapPin size={16} className="text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Known Location</p>
                      <p className="text-sm font-medium text-gray-700 truncate">{c.location?.address || 'No location set'}</p>
                    </div>
                    {(c.location?.lat || c.location?.town || c.location?.district) && (
                      <button
                        onClick={() => {
                          setSelectedLocation(c.location || { lat: 28.6139, lng: 77.2090, address: 'Demo Location' });
                          setSelectedLocationName(c.name);
                          setMapOpen(true);
                        }}
                        className="flex-shrink-0 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        title="View location on map"
                      >
                        <MapPin size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center">Last Visit</p>
                      <p className="text-sm font-black text-blue-700 text-center">{new Date(c.lastVisitDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-green-50/50 rounded-xl border border-green-100">
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest text-center">Next Visit</p>
                      <p className="text-sm font-black text-green-700 text-center">{new Date(c.nextVisitDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => handleEdit(c)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition"
                >
                  Edit
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
                  History
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Customer Modal (Modern Overlap) */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Add New Customer</h2>
                  <p className="text-sm text-gray-500">Enter details to register a new client</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 234 567 890"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Model</label>
                    <input
                      type="text"
                      placeholder="e.g. CollectionPro Elite X1"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.productModel}
                      onChange={(e) => setFormData({ ...formData, productModel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Location</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Detecting location..."
                          readOnly
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                          value={formData.location.address}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={getLocation}
                        className="bg-accent text-white p-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-100"
                      >
                        <MapPin size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Visit</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.lastVisitDate}
                      onChange={(e) => setFormData({ ...formData, lastVisitDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Next Visit</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.nextVisitDate}
                      onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-3 bg-accent text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:opacity-90 transition"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal (Modern Overlap) */}
      <AnimatePresence>
        {editingCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelEdit}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Edit Customer</h2>
                  <p className="text-sm text-gray-500">Update details for {editingCustomer.name}</p>
                </div>
                <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 234 567 890"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Model</label>
                    <input
                      type="text"
                      placeholder="e.g. CollectionPro Elite X1"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingCustomer.productModel}
                      onChange={(e) => setEditingCustomer({...editingCustomer, productModel: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Location</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Enter location..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                          value={editingCustomer.location?.address || ''}
                          onChange={(e) => setEditingCustomer({
                            ...editingCustomer, 
                            location: {
                              ...editingCustomer.location!,
                              address: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Visit</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingCustomer.lastVisitDate}
                      onChange={(e) => setEditingCustomer({...editingCustomer, lastVisitDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Next Visit</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingCustomer.nextVisitDate}
                      onChange={(e) => setEditingCustomer({...editingCustomer, nextVisitDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-3 bg-accent text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:opacity-90 transition"
                  >
                    Update Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Map Modal */}
      <LocationMap
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        location={selectedLocation || { lat: 0, lng: 0, address: '' }}
        name={selectedLocationName}
      />
    </div>
  );
}