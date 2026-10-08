import React, { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Car, CarBrand } from '../types';

interface HeroBannerProps {
  featuredCar: Car;
  activeBrand: CarBrand | 'ALL';
  onSelectBrand: (brand: CarBrand | 'ALL') => void;
  onExploreMore: () => void;
  onFindAvailableCars: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredCar,
  activeBrand,
  onSelectBrand,
  onExploreMore,
  onFindAvailableCars,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex flex-col justify-between bg-black overflow-hidden select-none">
      
      {/* Background Visual: Cinematic Car in Tunnel with liquid reflection */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=2400&q=85"
          alt="Mercedes-AMG C-Class"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        
        {/* Subtle Dark Lighting Scrim matching the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      </div>

      {/* Main Content Area (Left aligned, vertically centered) */}
      <div className="relative z-10 max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 w-full flex-1 flex flex-col justify-center pt-28 pb-12">
        <div className="max-w-2xl space-y-4">
          
          {/* Main Headline (MBCorpo S Title) */}
          <h1 className="font-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-white font-bold leading-[1.05] tracking-tight">
            Mercedes-AMG C-Class
          </h1>

          {/* Minimalist Subtitle */}
          <p className="text-white/90 text-sm sm:text-base font-normal tracking-wide">
            Chơi, rồi thay đổi cuộc chơi.
          </p>

          {/* Two Clean Pill Buttons (Matching image.png exactly) */}
          <div className="flex items-center gap-3.5 pt-3">
            {/* Pill 1: Tìm hiểu thêm */}
            <button
              onClick={onExploreMore}
              className="px-6 py-2.5 rounded-full border border-white/40 hover:border-white bg-black/40 hover:bg-white/10 backdrop-blur-md text-white text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              Tìm hiểu thêm
            </button>

            {/* Pill 2: Tìm xe có sẵn (Red Pill) */}
            <button
              onClick={onFindAvailableCars}
              className="px-6 py-2.5 rounded-full bg-[#c4151c] hover:bg-[#b01017] text-white text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer shadow-lg shadow-black/50"
            >
              Tìm xe có sẵn
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Pause button on the left, Sub-brand Switcher Capsule in the center */}
      <div className="relative z-10 max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 w-full pb-8 flex items-center justify-between">
        
        {/* Pause/Play circular toggle on left (from screenshot) */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full border border-white/40 bg-black/40 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        {/* Sub-brand Switcher Pill Capsule (Exact match to screenshot) */}
        <div className="mx-auto">
          <div className="flex items-center p-1 rounded-full border border-white/25 bg-black/60 backdrop-blur-md">
            
            {/* Mercedes-Benz Tab */}
            <button
              onClick={() => onSelectBrand('MERCEDES_BENZ')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                activeBrand === 'MERCEDES_BENZ'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Mercedes-Benz
            </button>

            {/* AMG Tab with AMG Logo Style */}
            <button
              onClick={() => onSelectBrand('AMG')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1 ${
                activeBrand === 'AMG'
                  ? 'bg-white text-black font-black shadow-sm'
                  : 'text-white/80 hover:text-white font-bold'
              }`}
            >
              <span className="italic tracking-tighter">///</span>AMG
            </button>

            {/* MAYBACH Tab */}
            <button
              onClick={() => onSelectBrand('MAYBACH')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeBrand === 'MAYBACH'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              MAYBACH
            </button>

          </div>
        </div>

        {/* Spacer to keep capsule perfectly centered */}
        <div className="w-8" />

      </div>

    </section>
  );
};
