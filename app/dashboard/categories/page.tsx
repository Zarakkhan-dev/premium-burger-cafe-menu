'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CategoriesTab } from '@/components/dashboard/CategoriesTab';

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your product categories and organization</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6">
          <CategoriesTab />
        </div>
      </div>
    </DashboardLayout>
  );
}