'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { 
  Download, Search, Users, ClipboardList, MapPin, 
  Package, ArrowRight, BarChart3, Filter, Check, X,
  UserCheck, UserX, Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from './LocationMap';

export default function GenericDashboard({ role, currentUser }: { role: string; currentUser?: { name: string; role: string; staticId: string; zone: string; branch: string; status: string } }) {
  const [customers, setCustomers] = useState<Array<{_id: string; name: string; customerName?: string; productModel?: string; product?: string; email?: string; mobile?: string; staticId?: string; location?: {address?: string; lat?: number; lng?: number}; visits?: number; nextVisitDate?: string; salesman?: {name?: string}; technician?: {name?: string}; hasVisit?: boolean}>>([]);
  const [services, setServices] = useState<Array<{_id: string; customerName: string; product: string; type: string; location?: {address?: string; lat?: number; lng?: number}; phone?: string; technician?: {name?: string}; visits?: number; nextVisitDate?: string}>>([]);
  const [users, setUsers] = useState<Array<{_id: string; name: string; email: string; mobile: string; staticId: string; role: string; status: string; branch?: string}>>([]);
  const [view, setView] = useState<'customers' | 'services' | 'staff' | 'approvedStaff'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('Verified');
  const [salesmanFilter, setSalesmanFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [nextVisitFilter, setNextVisitFilter] = useState('all');
  const [visitFilter, setVisitFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [userStatusFilter, salesmanFilter, technicianFilter, nextVisitFilter, visitFilter, dateFrom, dateTo]);

  const fetchAllData = async () => {
    try {
      const params: any = {};
      
      if (salesmanFilter) params.salesmanName = salesmanFilter;
      if (technicianFilter) params.technicianName = technicianFilter;
      
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

      const [custRes, servRes, userRes] = await Promise.all([
        api.get('/customers', { params }).catch(err => {
          console.error('Error fetching customers:', err.response?.status, err.response?.data);
          throw err;
        }),
        api.get('/services', { params }).catch(err => {
          console.error('Error fetching services:', err.response?.status, err.response?.data);
          throw err;
        }),
        api.get('/users', { params: { status: userStatusFilter } }).catch(err => {
          console.error('Error fetching users:', err.response?.status, err.response?.data);
          throw err;
        })
      ]);
      setCustomers(custRes.data);
      setServices(servRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
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

  const handleVerify = async (id: string, status: string) => {
    try {
      await api.patch(`/users/verify/${id}`, { status });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const exportData = () => {
    const data = view === 'customers' ? customers : view === 'services' ? services : users;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, view);
    XLSX.writeFile(wb, `${role}_${view}_Data.xlsx`);
  };

  const filteredData = (
    view === 'customers'
      ? customers
      : view === 'services'
      ? services
      : users
  ).filter((item) => {
  
    const name =
      'name' in item
        ? item.name
        : 'customerName' in item
        ? item.customerName
        : '';
  
    const product =
      'productModel' in item
        ? item.productModel
        : 'product' in item
        ? item.product
        : '';
  
    const email = 'email' in item ? item.email || '' : '';
    const mobile = 'mobile' in item ? item.mobile || '' : '';
    const staticId = 'staticId' in item ? item.staticId || '' : '';
  
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm) ||
      staticId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  

  return (
    <div className="space-y-6">
      {/* Header (GitHub/FB Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1c1e21]">{role} Overview</h1>
          <p className="text-gray-500 text-sm font-medium">Monitoring all active records and staff across your region</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm"
        >
          <Download size={18} />
          <span>Export {view}</span>
        </button>
      </div>

      {/* Analytics Row (GitHub Style Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border-b-4 border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Customers</p>
            <h3 className="text-2xl font-black mt-1">{customers.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl"><Users className="text-blue-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-b-4 border-green-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Services</p>
            <h3 className="text-2xl font-black mt-1">{services.length}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-xl"><ClipboardList className="text-green-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-b-4 border-yellow-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Staff</p>
            <h3 className="text-2xl font-black mt-1">{users.filter(u => u.status === 'Pending').length}</h3>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl"><Clock className="text-yellow-500" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-b-4 border-purple-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Performance</p>
            <h3 className="text-2xl font-black mt-1">94%</h3>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl"><BarChart3 className="text-purple-500" /></div>
        </div>
      </div>

      {/* Tabs and Search (FB Style) */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex p-1 bg-gray-50 rounded-xl w-fit overflow-x-auto">
          {[
            { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
            { id: 'services', label: 'Services', icon: <ClipboardList size={16} /> },
            { id: 'approvedStaff', label: 'Approved Staff', icon: <UserCheck size={16} /> },
            { id: 'staff', label: 'All Staff Requests', icon: <Clock size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setView(tab.id as any);
                if (tab.id === 'approvedStaff') {
                  setUserStatusFilter('Verified');
                } else if (tab.id === 'staff') {
                  setUserStatusFilter('Pending');
                }
              }}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                view === tab.id ? 'bg-white text-accent shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${view}...`} 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Conditional Filters */}
          {(view === 'staff' || view === 'approvedStaff') && (
            <div className="flex items-center gap-2">
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Pending">Pending Approval</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}

          {view === 'customers' && (
            <>
              <input
                type="text"
                placeholder="Filter by Salesman Name..."
                value={salesmanFilter}
                onChange={(e) => setSalesmanFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
              />
              <select
                value={nextVisitFilter}
                onChange={(e) => setNextVisitFilter(e.target.value)}
                className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Visits</option>
                <option value="yes">Has Next Visit</option>
                <option value="no">No Next Visit</option>
              </select>
              <select
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value)}
                className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Statuses</option>
                <option value="visited">Visited</option>
                <option value="notVisited">Not Visited</option>
              </select>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4">Filter by Next Visit Date:</span>
              <input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="Start date for next visit"
              />
              <input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="End date for next visit"
              />
            </>
          )}

          {view === 'services' && (
            <>
              <input
                type="text"
                placeholder="Filter by Technician Name..."
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
              />
              <select
                value={nextVisitFilter}
                onChange={(e) => setNextVisitFilter(e.target.value)}
                className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Visits</option>
                <option value="yes">Has Next Visit</option>
                <option value="no">No Next Visit</option>
              </select>
              <select
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value)}
                className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Statuses</option>
                <option value="visited">Visited</option>
                <option value="notVisited">Not Visited</option>
              </select>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4">Filter by Next Visit Date:</span>
              <input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="Start date for next visit"
              />
              <input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none transition text-sm"
                title="End date for next visit"
              />
            </>
          )}
        </div>
      </div>

      {/* Content Display (IG Style Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredData.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {view === 'staff' ? (
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

                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <p><span className="font-semibold">Email:</span> {item.email}</p>
                    <p><span className="font-semibold">Mobile:</span> {item.mobile}</p>
                    <p><span className="font-semibold">Static ID:</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-800">{item.staticId || 'N/A'}</span></p>
                    <p><span className="font-semibold">Branch:</span> {item.branch || 'N/A'}</p>
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
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-gray-900">{item.name || item.customerName}</h4>
                    <span className="bg-accent/10 text-accent text-xs font-black px-2 py-1 rounded uppercase tracking-tighter">
                      {view === 'customers' ? 'Record' : item.type}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                      <Package size={16} className="mr-2" />
                      <span>{item.productModel || item.product}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                      <MapPin size={16} className="mr-2" />
                      <span className="truncate">{item.location?.address}</span>
                    </div>
                    
                    {/* Added by Salesman/Technician */}
                    <div className="flex items-center text-gray-600 text-sm font-medium">
                      <Users size={16} className="mr-2" />
                      <span>
                        {view === 'customers' ? `Salesman: ${item.salesman?.name || 'N/A'}` : `Technician: ${item.technician?.name || 'N/A'}`}
                      </span>
                    </div>

                    {/* Visit Information */}
                    <div className="flex items-center text-gray-600 text-sm font-medium">
                      <Clock size={16} className="mr-2" />
                      <span>
                        Visits: {item.visits || 0}
                        {item.nextVisitDate && ` | Next: ${new Date(item.nextVisitDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Use actual location or demo location
                          const testLocation = item.location && item.location.lat && item.location.lng 
                            ? item.location 
                            : { lat: 28.6139, lng: 77.2090, address: 'Demo Location - Delhi' };
                          setSelectedLocation(testLocation);
                          setSelectedLocationName(item.name || item.customerName);
                          setMapOpen(true);
                        }}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition flex items-center gap-1"
                      >
                        <MapPin size={14} /> View Map
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(item._id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition flex items-center gap-1"
                      >
                        <X size={14} /> Delete
                      </button>
                    </div>
                    <button className="text-accent font-bold text-sm flex items-center hover:translate-x-1 transition-transform">
                      Details <ArrowRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
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
