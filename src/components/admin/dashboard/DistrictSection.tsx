import { useState } from 'react';
import { Search, LayoutGrid, Grid as GridIcon } from 'lucide-react';
import { Input } from '../../ui/Input';
import { DistrictCard } from './DistrictCard';
import { DistrictGridItem } from './DistrictGridItem';
import type { DistrictWithStats } from '../../../lib/services/systemAdmin.service';

interface DistrictSectionProps {
  districts: DistrictWithStats[];
}

export function DistrictSection({ districts }: DistrictSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('grid');

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* View Controls */}
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-medium text-[#1a1a1a]">
            Districts
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
              <Input
                type="text"
                placeholder="Search districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 border-[#e8e6e1] focus:border-[#c9a227]"
              />
            </div>
            {/* View mode toggle */}
            <div className="flex border border-[#e8e6e1] rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('card')}
                aria-label="Card view"
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium border-l border-[#e8e6e1] transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white text-[#8a8a8a] hover:bg-[#f5f3ef]'
                }`}
              >
                <GridIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDistricts.length === 0 ? (
            <div className="col-span-2 bg-white border border-[#e8e6e1] rounded-xl p-8 text-center text-[#8a8a8a]">
              {searchTerm
                ? 'No districts match your search'
                : 'No districts yet. Create your first district!'}
            </div>
          ) : (
            filteredDistricts.map((district) => (
              <DistrictCard
                key={district.id}
                district={district}
              />
            ))
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistricts.length === 0 ? (
            <div className="col-span-full bg-white border border-[#e8e6e1] rounded-xl p-8 text-center text-[#8a8a8a]">
              {searchTerm
                ? 'No districts match your search'
                : 'No districts yet. Create your first district!'}
            </div>
          ) : (
            filteredDistricts.map((district) => (
              <DistrictGridItem
                key={district.id}
                district={district}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
