import React, { useState, useEffect } from 'react';
import { Search, Globe, User, Heart, LayoutDashboard, BookmarkCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  onOpenCarsMenu: () => void;
  onOpenBuyMenu: () => void;
  onOpenServiceMenu: () => void;
  onOpenBrandMenu: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  currentUser: UserProfile | null;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenTracking: () => void;
  isAdminView: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCarsMenu,
  onOpenBuyMenu,
  onOpenServiceMenu,
  onOpenBrandMenu,
  onOpenSearch,
  onOpenAuth,
  currentUser,
  wishlistCount,
  onOpenWishlist,
  onOpenTracking,
  isAdminView,
  onToggleAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-white/10 py-3.5'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4.5'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between">
        
        {/* Left Zone: Minimal Category Nav (Exact match to screenshot) */}
        <nav className="flex items-center gap-6 sm:gap-8 text-[13px] font-normal text-white/90 tracking-wide">
          <button
            onClick={onOpenCarsMenu}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Các mẫu xe
          </button>
          <button
            onClick={onOpenBuyMenu}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Mua
          </button>
          <button
            onClick={onOpenServiceMenu}
            className="hover:text-white transition-colors cursor-pointer py-1 hidden sm:inline-block"
          >
            Dịch vụ
          </button>
          <button
            onClick={onOpenBrandMenu}
            className="hover:text-white transition-colors cursor-pointer py-1 hidden md:inline-block"
          >
            Thương hiệu
          </button>
        </nav>

        {/* Center Zone: Mercedes-Benz Emblem (Exact center) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group block p-1 focus:outline-none"
            aria-label="Mercedes-Benz Trang chủ"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/80 group-hover:border-white flex items-center justify-center transition-colors">
              <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.8c4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2-4.52 0-8.2-3.68-8.2-8.2 0-4.52 3.68-8.2 8.2-8.2zm0 1.6l-2.7 7.1H3.8c1.3 2.9 3.8 5.1 6.8 5.9l1.4-7.4 1.4 7.4c3-.8 5.5-3 6.8-5.9h-5.5L12 5.4z" />
              </svg>
            </div>
          </button>
        </div>

        {/* Right Zone: Provider, Search, Language, Login */}
        <div className="flex items-center gap-4 sm:gap-6 text-[13px] text-white/90">
          
          <span className="hidden xl:inline-block text-xs text-zinc-400 hover:text-white cursor-pointer">
            Provider/...
          </span>

          {/* Search icon */}
          <button
            onClick={onOpenSearch}
            className="p-1 hover:text-white text-zinc-300 transition-colors cursor-pointer"
            aria-label="Tìm kiếm"
            title="Tìm kiếm"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="relative p-1 hover:text-white text-zinc-300 transition-colors cursor-pointer"
            title="Xe đã lưu"
          >
            <Heart className="w-4 h-4 stroke-[2]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D11A2A] text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Language globe */}
          <button
            onClick={() => {}}
            className="hidden sm:inline-block p-1 hover:text-white text-zinc-300 transition-colors cursor-pointer"
            aria-label="Ngôn ngữ"
            title="Ngôn ngữ: Tiếng Việt"
          >
            <Globe className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Đăng nhập (Login button with user icon) */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-normal tracking-wide">
              {currentUser ? currentUser.name.split(' ').pop() : 'Đăng nhập'}
            </span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={onToggleAdmin}
              className={`p-1 text-xs rounded transition-colors ${
                isAdminView ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Quản trị"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
