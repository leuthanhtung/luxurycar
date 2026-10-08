import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { CarCard } from './components/CarCard';
import { CarDetailModal } from './components/CarDetailModal';
import { DepositCheckoutModal } from './components/DepositCheckoutModal';
import { OnTheRoadCalculatorModal } from './components/OnTheRoadCalculatorModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

import { Car, CarBrand, BodyType, Order, ColorOption, LeatherOption, PackageOption, UserProfile } from './types';
import { INITIAL_CARS } from './data/cars';
import { CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';

export default function App() {
  // Main data collections
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Filter and Search states
  const [activeBrand, setActiveBrand] = useState<CarBrand | 'ALL'>('AMG');
  const [searchQuery, setSearchQuery] = useState('');
  const [bodyType, setBodyType] = useState<BodyType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState('featured');

  // User Wishlist
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stuttgart_wishlist');
      return saved ? JSON.parse(saved) : ['car-amg-gt63s-e'];
    } catch {
      return ['car-amg-gt63s-e'];
    }
  });

  // Modal active states
  const [detailModalCar, setDetailModalCar] = useState<Car | null>(null);
  const [depositModalCar, setDepositModalCar] = useState<Car | null>(null);
  const [depositConfig, setDepositConfig] = useState<{
    exterior: ColorOption;
    interior: LeatherOption;
    packages: PackageOption[];
    totalPriceVnd: number;
  } | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch cars & orders from backend
  const loadData = async () => {
    try {
      const carsRes = await fetch('/api/cars');

      const carsData = await carsRes.json();
      if (carsData.success && carsData.data) {
        setCars(carsData.data);
      }

      if (currentUser?.role === 'ADMIN') {
        const ordersRes = await fetch('/api/orders');
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data) setOrders(ordersData.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Backend loading error', err);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.success) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem('stuttgart_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn(e);
    }
  }, [wishlistIds]);

  const toggleWishlist = (carId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(carId);
      if (exists) {
        showToast('Đã bỏ lưu xe');
        return prev.filter((id) => id !== carId);
      } else {
        showToast('Đã lưu vào danh sách quan tâm');
        return [...prev, carId];
      }
    });
  };

  // Filtered & sorted cars
  const filteredCars = useMemo(() => {
    let result = [...cars];

    if (activeBrand !== 'ALL') {
      result = result.filter((c) => c.brand === activeBrand);
    }

    if (bodyType !== 'ALL') {
      result = result.filter((c) => c.bodyType === bodyType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.vin.toLowerCase().includes(q) ||
          c.engine.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.priceVnd - b.priceVnd);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.priceVnd - a.priceVnd);
    } else if (sortBy === 'power-desc') {
      result.sort((a, b) => b.horsepower - a.horsepower);
    }

    return result;
  }, [cars, activeBrand, bodyType, searchQuery, sortBy]);

  const wishlistCars = useMemo(() => {
    return cars.filter((c) => wishlistIds.includes(c.id));
  }, [cars, wishlistIds]);

  const featuredCar = useMemo(() => {
    return cars.find((c) => c.isFeatured) || cars[0] || INITIAL_CARS[0];
  }, [cars]);

  // Handle direct deposit click from card
  const handleOpenDepositFromCard = (car: Car) => {
    setDepositModalCar(car);
    setDepositConfig({
      exterior: car.exteriorColors[0] || { name: 'Mặc định', code: 'default', hex: '#111', priceDeltaVnd: 0 },
      interior: car.interiorLeathers[0] || { name: 'Mặc định', type: 'Standard', hex: '#111', priceDeltaVnd: 0 },
      packages: [],
      totalPriceVnd: car.priceVnd,
    });
  };

  const handleOpenDepositFromDetail = (car: Car, config: any) => {
    setDetailModalCar(null);
    setDepositModalCar(car);
    setDepositConfig(config);
  };

  const handleResetFilters = () => {
    setActiveBrand('ALL');
    setBodyType('ALL');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-[#c4151c] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#161616] border border-white/20 text-white px-4 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar (Clean Mercedes-Benz official layout) */}
      <Navbar
        onOpenCarsMenu={() => {
          document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenBuyMenu={() => {
          document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenServiceMenu={() => setIsCalculatorOpen(true)}
        onOpenBrandMenu={() => {
          document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSearch={() => {
          document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        isAdminView={isAdminView}
        onToggleAdmin={() => {
          if (currentUser?.role === 'ADMIN') setIsAdminView(!isAdminView);
        }}
      />

      {/* Main View: Admin Console or Customer Storefront */}
      {isAdminView && currentUser?.role === 'ADMIN' ? (
        <AdminDashboard
          cars={cars}
          orders={orders}
          testDrives={[]}
          onRefreshData={loadData}
          onCloseAdmin={() => setIsAdminView(false)}
        />
      ) : (
        <main>
          {/* Hero Banner (Exact match to uploaded screenshot: Mercedes-AMG C-Class, pills, sub-brand switcher) */}
          <HeroBanner
            featuredCar={featuredCar}
            activeBrand={activeBrand}
            onSelectBrand={(brand) => {
              setActiveBrand(brand);
              document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreMore={() => setDetailModalCar(featuredCar)}
            onFindAvailableCars={() => {
              document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Section: "Tìm hiểu thêm" (Exact match to screenshot title & clean preview cards) */}
          <section id="explore-section" className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">
            <h2 className="font-title text-3xl sm:text-4xl text-white font-bold mb-8 tracking-tight">
              Tìm hiểu thêm
            </h2>

            {/* Clean Highlight Feature Cards (Minimalist, Large visual format) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              
              {/* Card 1: AMG Performance */}
              <div
                onClick={() => {
                  setActiveBrand('AMG');
                  document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-white/30 cursor-pointer transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80"
                  alt="Mercedes-AMG"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs text-zinc-400 font-medium tracking-wider mb-1">MERCEDES-AMG</div>
                  <h3 className="font-title text-xl font-bold text-white mb-2">Đẳng cấp đường đua F1</h3>
                  <div className="flex items-center gap-1 text-xs text-white group-hover:text-[#FF4A4A] transition-colors">
                    <span>Xem các mẫu xe AMG</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 2: Maybach Luxury */}
              <div
                onClick={() => {
                  setActiveBrand('MAYBACH');
                  document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-white/30 cursor-pointer transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?auto=format&fit=crop&w=1200&q=80"
                  alt="Mercedes-Maybach"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs text-zinc-400 font-medium tracking-wider mb-1">MERCEDES-MAYBACH</div>
                  <h3 className="font-title text-xl font-bold text-white mb-2">Đỉnh cao xa xỉ</h3>
                  <div className="flex items-center gap-1 text-xs text-white group-hover:text-amber-400 transition-colors">
                    <span>Khám phá khoang thương gia</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 3: Electric EQ */}
              <div
                onClick={() => {
                  setActiveBrand('MERCEDES_BENZ');
                  document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-white/30 cursor-pointer transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
                  alt="Mercedes-EQ"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs text-zinc-400 font-medium tracking-wider mb-1">MERCEDES-BENZ EQ</div>
                  <h3 className="font-title text-xl font-bold text-white mb-2">Kỷ nguyên thuần điện</h3>
                  <div className="flex items-center gap-1 text-xs text-white group-hover:text-blue-400 transition-colors">
                    <span>Tìm hiểu công nghệ MBUX</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Core Inventory Catalog Section */}
          <section id="inventory-section" className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-title text-2xl sm:text-3xl text-white font-bold tracking-tight">
                Xe có sẵn tại đại lý
              </h2>

              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Dự toán chi phí lăn bánh →
              </button>
            </div>

            {/* Filter Bar (Simplified, less text, clean pills) */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              bodyType={bodyType}
              onBodyTypeChange={setBodyType}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              totalResults={filteredCars.length}
              onResetFilters={handleResetFilters}
            />

            {/* Car Cards Grid */}
            {filteredCars.length === 0 ? (
              <div className="text-center py-20 bg-[#0E0E0E] border border-white/10 rounded-2xl p-6">
                <p className="text-sm text-zinc-400 mb-4">
                  Không tìm thấy xe phù hợp.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs transition-colors"
                >
                  Xem toàn bộ xe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isWishlisted={wishlistIds.includes(car.id)}
                    onToggleWishlist={toggleWishlist}
                    onSelectCar={(selected) => setDetailModalCar(selected)}
                    onDepositCar={handleOpenDepositFromCard}
                  />
                ))}
              </div>
            )}

          </section>
        </main>
      )}

      {/* Floating Mercedes Star / Assistant button at bottom right (from screenshot) */}
      <aside aria-label="Hỗ trợ trực tuyến" className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAuthOpen(true)}
          className="w-12 h-12 rounded-full border border-white/70 bg-black/85 backdrop-blur-md hover:border-white hover:scale-105 transition-all flex items-center justify-center text-white shadow-2xl cursor-pointer"
          title="Tài khoản Mercedes me"
          aria-label="Tài khoản Mercedes me"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.8c4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2-4.52 0-8.2-3.68-8.2-8.2 0-4.52 3.68-8.2 8.2-8.2zm0 1.6l-2.7 7.1H3.8c1.3 2.9 3.8 5.1 6.8 5.9l1.4-7.4 1.4 7.4c3-.8 5.5-3 6.8-5.9h-5.5L12 5.4z" />
          </svg>
        </button>
      </aside>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {/* 1. Auth Modal (Đăng nhập / Đăng ký) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Chào mừng ${user.name}!`);
        }}
        onLogout={() => {
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
          setCurrentUser(null);
          setIsAdminView(false);
          showToast('Đã đăng xuất tài khoản');
        }}
      />

      {/* 2. Car Detail Modal */}
      <CarDetailModal
        car={detailModalCar}
        onClose={() => setDetailModalCar(null)}
        onDeposit={handleOpenDepositFromDetail}
        isWishlisted={detailModalCar ? wishlistIds.includes(detailModalCar.id) : false}
        onToggleWishlist={toggleWishlist}
      />

      {/* 3. Deposit Modal */}
      <DepositCheckoutModal
        car={depositModalCar}
        config={depositConfig}
        onClose={() => setDepositModalCar(null)}
        onOrderCompleted={(order) => {
          loadData();
          showToast(`Đã xác nhận đặt cọc mã ${order.orderCode} thành công!`);
        }}
      />

      {/* 4. On-The-Road Calculator Modal */}
      {isCalculatorOpen && (
        <OnTheRoadCalculatorModal
          carsList={cars}
          onClose={() => setIsCalculatorOpen(false)}
          onSelectCarToDeposit={(car) => {
            setIsCalculatorOpen(false);
            handleOpenDepositFromCard(car);
          }}
        />
      )}

      {/* 5. Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistCars={wishlistCars}
        onRemoveWishlist={toggleWishlist}
        onSelectCar={(car) => {
          setIsWishlistOpen(false);
          setDetailModalCar(car);
        }}
        onDepositCar={(car) => {
          setIsWishlistOpen(false);
          handleOpenDepositFromCard(car);
        }}
      />

      {/* 6. Order Tracking Modal */}
      {isTrackingOpen && (
        <OrderTrackingModal
          onClose={() => setIsTrackingOpen(false)}
          recentOrders={orders}
        />
      )}

    </div>
  );
}
