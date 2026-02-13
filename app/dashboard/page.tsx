'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import OwnerDashboard from '@/components/OwnerDashboard';
import SalesmanDashboard from '@/components/SalesmanDashboard';
import TechnicianDashboard from '@/components/TechnicianDashboard';
import GenericDashboard from '@/components/GenericDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Owner':
        return <OwnerDashboard />;
      case 'Salesman':
        return <SalesmanDashboard />;
      case 'Technician':
        return <TechnicianDashboard />;
      case 'Regional Manager':
      case 'Manager':
        return <GenericDashboard role={user.role} />;
      default:
        return <div>Invalid Role</div>;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
