import type { ReactNode } from 'react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';

export function V2PublicLayout({ children }: { children?: ReactNode }) {
  const { slug } = useSubdomain();
  const { data: district, isLoading } = useDistrict(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-500">District not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {district.logo_url ? (
            <img src={district.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: district.primary_color || '#1e293b' }}
            >
              {district.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-lg font-semibold text-gray-900">{district.name}</span>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
