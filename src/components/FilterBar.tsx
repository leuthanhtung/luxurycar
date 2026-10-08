import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { BodyType, StockStatus } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bodyType: BodyType | 'ALL';
  onBodyTypeChange: (body: BodyType | 'ALL') => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalResults: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  bodyType,
  onBodyTypeChange,
  sortBy,
  onSortByChange,
  totalResults,
  onResetFilters,
}) => {
  return (
    <div className="mb-10 space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Clean Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm dòng xe (C-Class, GT 63, S 680, G 63...)"
            className="w-full bg-[#111111] border border-white/20 focus:border-white rounded-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
          <span className="text-zinc-400 hidden sm:inline">
            <strong className="text-white font-medium">{totalResults}</strong> mẫu xe sẵn có
          </span>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-[#111111] border border-white/20 rounded-full px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="featured">Đặc sắc nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="power-desc">Công suất cao nhất</option>
            </select>
          </div>
        </div>

      </div>

      {/* Body Types Pill Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'ALL', label: 'Tất cả kiểu dáng' },
          { id: 'SEDAN', label: 'Sedan' },
          { id: 'SUV', label: 'SUV' },
          { id: 'COUPE', label: 'Coupe' },
          { id: 'CABRIOLET', label: 'Mui trần' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onBodyTypeChange(item.id as any)}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              bodyType === item.id
                ? 'bg-white text-black font-semibold'
                : 'bg-[#111111] border border-white/20 text-zinc-300 hover:text-white hover:border-white/50'
            }`}
          >
            {item.label}
          </button>
        ))}

        {bodyType !== 'ALL' && (
          <button
            onClick={onResetFilters}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors ml-1"
            title="Đặt lại"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
