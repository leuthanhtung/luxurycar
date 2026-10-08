import React, { useState } from 'react';
import { X, Check, Heart, Gauge, Flame, DollarSign, Rotate3d, ChevronLeft, ChevronRight, Sliders, CheckCircle } from 'lucide-react';
import { Car, ColorOption, LeatherOption, PackageOption } from '../types';
import { formatVnd, formatExactVnd, formatUsd } from '../utils/format';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onDeposit: (car: Car, config: { exterior: ColorOption; interior: LeatherOption; packages: PackageOption[]; totalPriceVnd: number }) => void;
  isWishlisted: boolean;
  onToggleWishlist: (carId: string) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
  onDeposit,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!car) return null;

  // Active view states
  const [activeMediaTab, setActiveMediaTab] = useState<'EXTERIOR' | 'INTERIOR' | '360'>('EXTERIOR');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [view360Angle, setView360Angle] = useState(0);

  // Customization state
  const [selectedExterior, setSelectedExterior] = useState<ColorOption>(car.exteriorColors[0] || { name: 'Mặc định', code: 'default', hex: '#111', priceDeltaVnd: 0 });
  const [selectedInterior, setSelectedInterior] = useState<LeatherOption>(car.interiorLeathers[0] || { name: 'Mặc định', type: 'Standard', hex: '#111', priceDeltaVnd: 0 });
  const [selectedPackages, setSelectedPackages] = useState<PackageOption[]>([]);

  // Active tab in modal details
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'SPECS' | 'ON_THE_ROAD'>('CONFIG');

  // Province for on-the-road calculation
  const [selectedProvince, setSelectedProvince] = useState<'HANOI' | 'HCMC' | 'OTHER'>('HCMC');

  // Compute live price
  const basePrice = car.priceVnd;
  const exteriorDelta = selectedExterior.priceDeltaVnd || 0;
  const interiorDelta = selectedInterior.priceDeltaVnd || 0;
  const packagesTotal = selectedPackages.reduce((acc, p) => acc + (p.priceVnd || 0), 0);
  const finalConfigPrice = basePrice + exteriorDelta + interiorDelta + packagesTotal;

  // On-the-road calculation
  const isElectric = car.fuelType === 'EQ_ELECTRIC';
  const taxRate = isElectric ? 0 : (selectedProvince === 'HANOI' ? 0.12 : 0.10);
  const taxAmount = Math.round(finalConfigPrice * taxRate);
  const plateFee = (selectedProvince === 'HANOI' || selectedProvince === 'HCMC') ? 20000000 : 1000000;
  const roadMaintenance = 1560000;
  const inspectionFee = 90000;
  const civilInsurance = 480700;
  const physicalInsurance = Math.round(finalConfigPrice * 0.014);
  const totalOnTheRoad = finalConfigPrice + taxAmount + plateFee + roadMaintenance + inspectionFee + civilInsurance + physicalInsurance;

  const togglePackage = (pkg: PackageOption) => {
    if (selectedPackages.some(p => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter(p => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111111] border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400">
              {car.brand === 'AMG' ? 'Mercedes-AMG' : car.brand === 'MAYBACH' ? 'Mercedes-Maybach' : 'Mercedes-Benz'}
            </span>
            <h3 className="font-title text-lg font-bold text-white">{car.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(car.id)}
              className={`p-2 rounded-full border transition-colors ${
                isWishlisted
                  ? 'bg-[#c4151c] border-[#c4151c] text-white'
                  : 'bg-black/40 border-white/20 text-zinc-300 hover:text-white'
              }`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-white/10 border border-white/20 text-zinc-400 hover:text-white transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          
          {/* Main Visual Showcase */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-white/10 group">
            {activeMediaTab === '360' ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
                <img
                  src={car.images[0]?.imageUrl}
                  alt={`${car.title} 360`}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `rotate(${view360Angle * 2}deg) scale(${1 + Math.abs(Math.sin(view360Angle)) * 0.05})`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="w-full h-full object-contain"
                />
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-4 text-xs text-white">
                  <button
                    onClick={() => setView360Angle(prev => (prev - 1 + 8) % 8)}
                    className="p-1 hover:text-[#c4151c] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-zinc-300">Góc: {view360Angle * 45}°</span>
                  <button
                    onClick={() => setView360Angle(prev => (prev + 1) % 8)}
                    className="p-1 hover:text-[#c4151c] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={car.images[activeImageIndex]?.imageUrl || car.images[0]?.imageUrl}
                alt={car.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Media Tab Selector */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-full border border-white/20">
              <button
                onClick={() => { setActiveMediaTab('EXTERIOR'); setActiveImageIndex(0); }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeMediaTab === 'EXTERIOR' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ngoại thất
              </button>
              <button
                onClick={() => {
                  setActiveMediaTab('INTERIOR');
                  const intIdx = car.images.findIndex(img => img.viewType === 'INTERIOR');
                  setActiveImageIndex(intIdx >= 0 ? intIdx : 0);
                }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeMediaTab === 'INTERIOR' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Nội thất
              </button>
              <button
                onClick={() => setActiveMediaTab('360')}
                className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  activeMediaTab === '360' ? 'bg-[#c4151c] text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                360°
              </button>
            </div>
          </div>

          {/* Model Title & Price Line */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-title font-bold text-2xl text-white">
                {car.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                {car.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] text-zinc-400">Giá theo cấu hình</div>
              <div className="text-2xl font-bold font-title text-white tabular-nums">
                {formatVnd(finalConfigPrice)}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('CONFIG')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                activeTab === 'CONFIG'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tùy biến màu sắc & Gói phụ kiện
            </button>
            <button
              onClick={() => setActiveTab('SPECS')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                activeTab === 'SPECS'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab('ON_THE_ROAD')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                activeTab === 'ON_THE_ROAD'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dự toán lăn bánh
            </button>
          </div>

          {/* TAB 1: Configurator */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-6">
              
              {/* Exterior Colors */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                  Màu sơn: <span className="text-white font-normal">{selectedExterior.name}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {car.exteriorColors.map((color) => {
                    const isSelected = selectedExterior.code === color.code;
                    return (
                      <button
                        key={color.code}
                        onClick={() => setSelectedExterior(color)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border-white shadow-sm'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-white/40 shrink-0 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="overflow-hidden">
                          <div className="text-xs font-medium text-white truncate">{color.name}</div>
                          <div className="text-[10px] text-zinc-400">
                            {color.priceDeltaVnd === 0 ? 'Tiêu chuẩn' : `+${formatVnd(color.priceDeltaVnd)}`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interior Leathers */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                  Nội thất da: <span className="text-white font-normal">{selectedInterior.name}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {car.interiorLeathers.map((leather) => {
                    const isSelected = selectedInterior.name === leather.name;
                    return (
                      <button
                        key={leather.name}
                        onClick={() => setSelectedInterior(leather)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border-white shadow-sm'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: leather.hex }}
                        />
                        <div className="overflow-hidden">
                          <div className="text-xs font-medium text-white truncate">{leather.name}</div>
                          <div className="text-[10px] text-zinc-400">{leather.type}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Packages */}
              {car.availablePackages.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                    Gói trang bị nâng cấp
                  </h4>
                  <div className="space-y-2">
                    {car.availablePackages.map((pkg) => {
                      const isSelected = selectedPackages.some(p => p.id === pkg.id);
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => togglePackage(pkg)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-white/10 border-white'
                              : 'bg-black/40 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white border-white text-black' : 'border-white/40 bg-black'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">{pkg.name}</div>
                              <div className="text-[11px] text-zinc-400">{pkg.description}</div>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-white tabular-nums shrink-0">
                            +{formatVnd(pkg.priceVnd)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Specs */}
          {activeTab === 'SPECS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Động cơ & Vận hành</div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Kiểu động cơ:</span>
                  <span className="text-white text-right">{car.engine}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Công suất:</span>
                  <span className="text-white font-medium">{car.horsepower} HP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Mô-men xoắn:</span>
                  <span className="text-white">{car.torqueNm} Nm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">0 - 100 km/h:</span>
                  <span className="text-white font-semibold">{car.acceleration} giây</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Tốc độ tối đa:</span>
                  <span className="text-white">{car.topSpeedKmh} km/h</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Kích thước & Thiết kế</div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Dài x Rộng x Cao:</span>
                  <span className="text-white">{car.dimensions}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Chiều dài cơ sở:</span>
                  <span className="text-white">{car.wheelbase} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Số chỗ ngồi:</span>
                  <span className="text-white">{car.seatingCapacity} chỗ</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Tiêu thụ nhiên liệu:</span>
                  <span className="text-white">{car.fuelEconomy}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Số khung VIN:</span>
                  <span className="text-white font-mono">{car.vin}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: On-the-road Cost Calculator */}
          {activeTab === 'ON_THE_ROAD' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="font-semibold text-zinc-300 block mb-2">Khu vực đăng ký biển số:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'HANOI', label: 'Hà Nội (Trước bạ 12%)' },
                    { id: 'HCMC', label: 'TP. Hồ Chí Minh (Trước bạ 10%)' },
                    { id: 'OTHER', label: 'Tỉnh thành khác (10%)' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvince(p.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedProvince === p.id
                          ? 'bg-white text-black font-semibold'
                          : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Giá xe xuất hóa đơn:</span>
                  <span className="text-white font-semibold tabular-nums">{formatExactVnd(finalConfigPrice)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Lệ phí trước bạ:</span>
                  <span className="text-white tabular-nums">{formatExactVnd(taxAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Phí cấp biển số mới:</span>
                  <span className="text-white tabular-nums">{formatExactVnd(plateFee)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Bảo hiểm & Phí đường bộ (1 năm):</span>
                  <span className="text-white tabular-nums">{formatExactVnd(roadMaintenance + civilInsurance + inspectionFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/15">
                  <span className="font-semibold text-white">Tổng chi phí lăn bánh:</span>
                  <span className="font-title font-bold text-base text-emerald-400 tabular-nums">
                    {formatExactVnd(totalOnTheRoad)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Tiền cọc giữ xe tối thiểu: <span className="text-white font-semibold">{formatVnd(car.depositMinVnd)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/30 text-xs font-medium text-white hover:border-white transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onDeposit(car, {
                  exterior: selectedExterior,
                  interior: selectedInterior,
                  packages: selectedPackages,
                  totalPriceVnd: finalConfigPrice,
                });
              }}
              className="px-7 py-2.5 rounded-full bg-[#c4151c] hover:bg-[#b01017] text-xs font-medium tracking-wide text-white transition-all cursor-pointer shadow-lg shadow-black/50"
            >
              Đặt cọc xe ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
