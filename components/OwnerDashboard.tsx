'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Check, X, Download, Filter, Search, UserCheck, UserPlus, Clock, Users, ClipboardList, MapPin, Package, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import LocationMap from './LocationMap';

export default function OwnerDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [view, setView] = useState<'users' | 'customers' | 'services'>('users');
  const [filters, setFilters] = useState({ zone: '', branch: '', role: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [salesmanFilter, setSalesmanFilter] = useState(''); // Add salesman filter
  const [technicianFilter, setTechnicianFilter] = useState(''); // Add technician filter
  const [nextVisitFilter, setNextVisitFilter] = useState('all'); // Add visit filters
  const [visitFilter, setVisitFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  const fetchAllData = async () => {
    try {
      const params: any = { ...filters };
      
      // Add salesman and technician filters
      if (view === 'customers' && salesmanFilter) {
        params.salesmanName = salesmanFilter;
      }
      if (view === 'services' && technicianFilter) {
        params.technicianName = technicianFilter;
      }
      
      // Add visit filters
      if (view === 'customers' || view === 'services') {
        // When date range is selected, automatically filter to show only items with visits in that range
        if (dateFrom || dateTo) {
          params.nextVisit = 'true';  // Only show items with scheduled visits
        } else {
          if (nextVisitFilter === 'yes') params.nextVisit = 'true';
          else if (nextVisitFilter === 'no') params.nextVisit = 'false';
        }
        
        if (visitFilter === 'visited') params.hasVisit = 'true';
        else if (visitFilter === 'notVisited') params.hasVisit = 'false';
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
      }

      const [userRes, custRes, servRes] = await Promise.all([
        api.get('/users', { params: filters }),
        api.get('/customers', { params }),
        api.get('/services', { params })
      ]);
      setUsers(userRes.data);
      setCustomers(custRes.data);
      setServices(servRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filters, view, salesmanFilter, technicianFilter, nextVisitFilter, visitFilter, dateFrom, dateTo]);

  const handleVerify = async (id: string, status: string) => {
    try {
      await api.patch(`/users/verify/${id}`, { status });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/customers/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete customer');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/services/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete service');
    }
  };

  const exportData = () => {
    const data = view === 'users' ? users : view === 'customers' ? customers : services;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, view);
    XLSX.writeFile(wb, `Owner_${view}_Data.xlsx`);
  };

  const filteredData = () => {
    const data = view === 'users' ? users : view === 'customers' ? customers : services;
    return data.filter((item: any) => {
      const name = item.name || item.customerName || '';
      const email = item.email || '';
      const mobile = item.mobile || '';
      const staticId = item.staticId || '';
      const product = item.productModel || item.product || '';

      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             mobile.includes(searchTerm) ||
             staticId.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview (GitHub Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Users', count: users.filter(u => u.status === 'Pending').length, icon: <Clock className="text-yellow-500" />, color: 'border-yellow-200' },
          { label: 'Total Staff', count: users.length, icon: <UserPlus className="text-blue-500" />, color: 'border-blue-200' },
          { label: 'Total Customers', count: customers.length, icon: <Users className="text-green-500" />, color: 'border-green-200' },
          { label: 'Total Services', count: services.length, icon: <ClipboardList className="text-purple-500" />, color: 'border-purple-200' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-xl border-b-4 ${stat.color} shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1">{stat.count}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Tab Switching (FB Style) */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'users', label: 'Staff Members', icon: <UserCheck size={16} /> },
          { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
          { id: 'services', label: 'Services', icon: <ClipboardList size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              view === tab.id ? 'bg-white text-accent shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search & Filters (FB Style) */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${view}...`} 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
          >
            <Download size={16} />
            <span>Export {view}</span>
          </button>
                  
          {/* Users-specific filters */}
          {view === 'users' && (
            <>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <Filter size={16} className="text-gray-400" />
                <select
                  className="text-sm font-semibold outline-none bg-transparent cursor-pointer"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <select
                  className="text-sm font-semibold outline-none bg-transparent cursor-pointer"
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="Regional Manager">Regional Manager</option>
                  <option value="Manager">Manager</option>
                  <option value="Salesman">Salesman</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>
            </>
          )}
                  
          {/* Customers-specific filters */}
          {view === 'customers' && (
            <>
              <input
                type="text"
                placeholder="Filter by Salesman Name..."
                value={salesmanFilter}
                onChange={(e) => setSalesmanFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
              />
              <select
                value={nextVisitFilter}
                onChange={(e) => setNextVisitFilter(e.target.value)}
                className="bg-white border border-gray-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Visits</option>
                <option value="yes">Has Next Visit</option>
                <option value="no">No Next Visit</option>
              </select>
              <select
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value)}
                className="bg-white border border-gray-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Statuses</option>
                <option value="visited">Visited</option>
                <option value="notVisited">Not Visited</option>
              </select>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 hidden md:inline">Filter by Next Visit Date:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="Start date for next visit"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="End date for next visit"
              />
            </>
          )}
                  
          {/* Services-specific filters */}
          {view === 'services' && (
            <>
              <input
                type="text"
                placeholder="Filter by Technician Name..."
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
              />
              <select
                value={nextVisitFilter}
                onChange={(e) => setNextVisitFilter(e.target.value)}
                className="bg-white border border-gray-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Visits</option>
                <option value="yes">Has Next Visit</option>
                <option value="no">No Next Visit</option>
              </select>
              <select
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value)}
                className="bg-white border border-gray-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Statuses</option>
                <option value="visited">Visited</option>
                <option value="notVisited">Not Visited</option>
              </select>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 hidden md:inline">Filter by Next Visit Date:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="Start date for next visit"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="End date for next visit"
              />
            </>
          )}
                  
          {/* Zone and Branch filters (always visible) */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <select
              className="text-sm font-semibold outline-none bg-transparent cursor-pointer"
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            >
              <option value="">All Zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
            </select>
          </div>
                  
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <select
              className="text-sm font-semibold outline-none bg-transparent cursor-pointer"
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            >
              <option value="">All Branches</option>
              <option value="Branch 1">Branch 1</option>
              <option value="Branch 2">Branch 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid (IG/FB Mix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData().map((item) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={item._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {view === 'users' ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl">
                      {(item.name)?.[0] || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs font-bold text-accent uppercase tracking-wider">{item.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold w-20">Static ID:</span>
                    <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{item.staticId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold w-20">Email:</span>
                    <span className="truncate">{item.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold w-20">Mobile:</span>
                    <span>{item.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold w-20">Static ID:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-bold">{item.staticId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold w-20">Zone:</span>
                    <span>{item.zone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold w-20">Branch:</span>
                    <span>{item.branch || 'N/A'}</span>
                  </div>
                </div>

                {item.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(item._id, 'Verified')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-600 transition flex items-center justify-center gap-1"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleVerify(item._id, 'Rejected')}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-1"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ) : view === 'customers' ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {(item.name || item.customerName)?.[0] || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name || item.customerName}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{item.zone} | {item.branch}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    Customer
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                      <Package size={14} className="text-blue-500" />
                      Product Details
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{item.productModel}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-xs">
                      <p className="text-gray-400 font-bold uppercase">Mobile</p>
                      <p className="font-semibold text-gray-700">{item.phone || item.mobile}</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400 font-bold uppercase">Added By</p>
                      <p className="font-semibold text-gray-700">{item.salesman?.name || 'Staff'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const testLocation = item.location && item.location.lat && item.location.lng 
                              ? item.location 
                              : { lat: 28.6139, lng: 77.2090, address: 'Demo Location - Delhi' };
                            setSelectedLocation(testLocation);
                            setSelectedLocationName(item.name || item.customerName);
                            setMapOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition"
                        >
                          <MapPin size={14} className="inline mr-1" /> View Map
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomer(item._id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition flex items-center gap-1"
                      >
                        <X size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl">
                      {(item.customerName)?.[0] || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.customerName}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{item.zone} | {item.branch}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                    Service
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                      <Package size={14} className="text-purple-500" />
                      Service Description
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{item.product}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-xs">
                      <p className="text-gray-400 font-bold uppercase">Mobile</p>
                      <p className="font-semibold text-gray-700">{item.phone}</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400 font-bold uppercase">Technician</p>
                      <p className="font-semibold text-gray-700">{item.technician?.name || 'Staff'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const testLocation = item.location && item.location.lat && item.location.lng 
                              ? item.location 
                              : { lat: 28.6139, lng: 77.2090, address: 'Demo Location - Delhi' };
                            setSelectedLocation(testLocation);
                            setSelectedLocationName(item.customerName);
                            setMapOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition"
                        >
                          <MapPin size={14} className="inline mr-1" /> View Map
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteService(item._id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition flex items-center gap-1"
                      >
                        <X size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Location Map Modal */}
      <LocationMap
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        location={selectedLocation}
        name={selectedLocationName}
      />
    </div>
  );
}
