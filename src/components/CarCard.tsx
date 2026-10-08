import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Car } from '../types';
import { formatVnd } from '../utils/format';

interface CarCardProps {
  car: Car;
  isWishlisted: boolean;
  onToggleWishlist: (carId: string) => void;
  onSelectCar: (car: Car) => void;
  onDepositCar: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isWishlisted,
  onToggleWishlist,
  onSelectCar,
  onDepositCar,
}) => {
  const [imgError, setImgError] = useState(false);
  const primaryImage = car.images[0]?.imageUrl || '';

  return (
    <div className="group relative bg-[#0D0D0D] hover:bg-[#121212] border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col">
      
      {/* Visual Image container (Clean, large, 16:10 aspect ratio) */}
      <div 
        onClick={() => onSelectCar(car)}
        className="relative aspect-[16/10] w-full overflow-hidden bg-black cursor-pointer"
      >
        {!imgError ? (
          <img
            src={primaryImage}
            alt={car.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">
            {car.title}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(car.id);
          }}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-[#c4151c] text-white'
              : 'bg-black/50 text-white hover:bg-black/80'
          }`}
          title={isWishlisted ? 'Bỏ lưu' : 'Lưu xe'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Subtle Brand Tag (Top Left) */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/15">
          {car.brand === 'AMG' ? 'Mercedes-AMG' : car.brand === 'MAYBACH' ? 'Mercedes-Maybach' : 'Mercedes-Benz'}
        </div>
      </div>

      {/* Card Content - Minimalist, Spacious, MBCorpo S Title typography */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Engine/Category line */}
          <div className="text-[12px] text-zinc-400 font-normal tracking-wide mb-1">
            {car.engine}
          </div>

          {/* Model Title */}
          <h3
            onClick={() => onSelectCar(car)}
            className="font-title text-xl text-white font-semibold hover:text-zinc-200 transition-colors cursor-pointer line-clamp-1"
          >
            {car.title}
          </h3>

          {/* Key Specs in clean single line */}
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
            <span>{car.horsepower} HP</span>
            <span className="text-zinc-600">·</span>
            <span>0-100 km/h: <strong className="text-white font-medium">{car.acceleration}s</strong></span>
            <span className="text-zinc-600">·</span>
            <span>{car.year}</span>
          </div>
        </div>

        {/* Pricing and Minimalist Action Buttons */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Giá đề xuất</span>
            <span className="font-title text-lg font-bold text-white tabular-nums">
              {formatVnd(car.priceVnd)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onSelectCar(car)}
              className="py-2.5 px-4 rounded-full border border-white/30 hover:border-white text-xs font-medium text-white transition-colors text-center cursor-pointer"
            >
              Tìm hiểu thêm
            </button>
            <button
              onClick={() => onDepositCar(car)}
              className="py-2.5 px-4 rounded-full bg-[#c4151c] hover:bg-[#b01017] text-xs font-medium text-white transition-colors text-center cursor-pointer shadow-md shadow-black/40"
            >
              Đặt cọc ngay
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
