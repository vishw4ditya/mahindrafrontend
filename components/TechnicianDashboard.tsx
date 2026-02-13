'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, MapPin, Download, Search, Settings, Calendar, Phone, Wrench, ArrowRight, X, Clock, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from './LocationMap';

export default function TechnicianDashboard() {
  const [services, setServices] = useState<Array<{_id: string; customerName: string; phone: string; product: string; type: string; location?: {address?: string; lat?: number; lng?: number; town?: string; district?: string}; lastVisitDate: string; nextVisitDate: string}>>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat?: number; lng?: number; address?: string; town?: string; district?: string} | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    product: '',
    type: 'Service',
    lastVisitDate: '',
    nextVisitDate: '',
    location: { lat: 0, lng: 0, address: '' }
  });
  const [editingService, setEditingService] = useState<{
    _id?: string;
    customerName: string;
    phone: string;
    product: string;
    type: string;
    lastVisitDate: string;
    nextVisitDate: string;
    location?: { lat: number; lng: number; address: string; town?: string; district?: string };
  } | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
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
      await api.post('/services', formData);
      setShowForm(false);
      fetchServices();
      setFormData({
        customerName: '', phone: '', product: '', type: 'Service', lastVisitDate: '', nextVisitDate: '',
        location: { lat: 0, lng: 0, address: '' }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const exportData = () => {
    const dataToExport = services.map(s => ({
      Customer: s.customerName,
      Phone: s.phone,
      Product: s.product,
      Type: s.type,
      Location: s.location?.address,
      LastVisit: s.lastVisitDate,
      NextVisit: s.nextVisitDate
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Services");
    XLSX.writeFile(wb, "My_Services.xlsx");
  };

  const filteredServices = services.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (service: {_id: string; customerName: string; phone: string; product: string; type: string; lastVisitDate: string; nextVisitDate: string; location?: {address?: string; lat?: number; lng?: number; town?: string; district?: string}}) => {
    setEditingService({
      _id: service._id,
      customerName: service.customerName,
      phone: service.phone,
      product: service.product,
      type: service.type,
      lastVisitDate: service.lastVisitDate?.split('T')[0] || '',
      nextVisitDate: service.nextVisitDate?.split('T')[0] || '',
      location: service.location ? {
        lat: service.location.lat || 0,
        lng: service.location.lng || 0,
        address: service.location.address || ''
      } : { lat: 0, lng: 0, address: '' }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?._id) return;

    try {
      await api.put(`/services/${editingService._id}`, editingService);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header (GitHub/FB Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c1e21]">Service Management</h1>
          <p className="text-gray-500 text-sm font-medium">Track and update service records for your clients</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
          >
            <Download size={18} />
            <span>Export Logs</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-accent text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-md shadow-blue-200 font-bold text-sm"
          >
            <Plus size={18} />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* Quick Stats (GitHub Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', count: services.length, icon: <Settings className="text-blue-500" />, color: 'border-blue-200' },
          { label: 'Today\'s Tasks', count: 0, icon: <Clock className="text-yellow-500" />, color: 'border-yellow-200' },
          { label: 'Installations', count: services.filter(s => s.type === 'Installation').length, icon: <CheckCircle2 className="text-green-500" />, color: 'border-green-200' },
          { label: 'Pending Repairs', count: services.filter(s => s.type === 'Service').length, icon: <Settings className="text-red-500" />, color: 'border-red-200' },
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

      {/* Search (FB Style) */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search by customer, phone or product..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Service Grid (IG/FB Mix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredServices.map((s) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={s._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100">
                      {s.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors">{s.customerName}</h3>
                      <p className="text-xs text-gray-500 font-medium">{s.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    s.type === 'Installation' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {s.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Settings size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</p>
                      <p className="text-sm font-bold text-gray-700">{s.product}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MapPin size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Location</p>
                      <p className="text-sm font-medium text-gray-700 truncate">{s.location?.address || 'Location Not Recorded'}</p>
                    </div>
                    {(s.location?.lat || s.location?.town || s.location?.district) && (
                      <button
                        onClick={() => {
                          setSelectedLocation(s.location || { lat: 28.6139, lng: 77.2090, address: 'Demo Location' });
                          setSelectedLocationName(s.customerName);
                          setMapOpen(true);
                        }}
                        className="flex-shrink-0 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        title="View service location on map"
                      >
                        <MapPin size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Service</p>
                      <p className="text-sm font-black text-gray-700">{new Date(s.lastVisitDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Next Due</p>
                      <p className="text-sm font-black text-accent">{new Date(s.nextVisitDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => handleEdit(s)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition"
                >
                  Edit
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
                  Status
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Service Modal (Modern Overlap) */}
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
                  <h2 className="text-xl font-black text-gray-900">New Service Record</h2>
                  <p className="text-sm text-gray-500">Record a maintenance or installation task</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 999 000 111"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product</label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Pump X"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Task Type</label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition bg-white"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Service">Routine Service</option>
                      <option value="Installation">Installation</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Service Location</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Detecting..."
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
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Service</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={formData.lastVisitDate}
                      onChange={(e) => setFormData({ ...formData, lastVisitDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Next Service</label>
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
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-3 bg-accent text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:opacity-90 transition"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Service Modal (Modern Overlap) */}
      <AnimatePresence>
        {editingService && (
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
                  <h2 className="text-xl font-black text-gray-900">Edit Service</h2>
                  <p className="text-sm text-gray-500">Update details for {editingService.customerName}</p>
                </div>
                <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingService.customerName}
                      onChange={(e) => setEditingService({...editingService, customerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 999 000 111"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingService.phone}
                      onChange={(e) => setEditingService({...editingService, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product</label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Pump X"
                      required
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingService.product}
                      onChange={(e) => setEditingService({...editingService, product: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Task Type</label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition bg-white"
                      value={editingService.type}
                      onChange={(e) => setEditingService({...editingService, type: e.target.value})}
                    >
                      <option value="Service">Routine Service</option>
                      <option value="Installation">Installation</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Service Location</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Enter location..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                          value={editingService.location?.address || ''}
                          onChange={(e) => setEditingService({
                            ...editingService, 
                            location: {
                              ...editingService.location!,
                              address: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Service</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingService.lastVisitDate}
                      onChange={(e) => setEditingService({...editingService, lastVisitDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Next Service</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition"
                      value={editingService.nextVisitDate}
                      onChange={(e) => setEditingService({...editingService, nextVisitDate: e.target.value})}
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
                    Update Service
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
