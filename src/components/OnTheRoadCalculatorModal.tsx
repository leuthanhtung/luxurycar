import React, { useState } from 'react';
import { X, DollarSign, Calculator, MapPin, Shield, Check, Info } from 'lucide-react';
import { Car } from '../types';
import { formatExactVnd, formatVnd } from '../utils/format';

interface OnTheRoadCalculatorModalProps {
  carsList: Car[];
  onClose: () => void;
  onSelectCarToDeposit: (car: Car) => void;
}

export const OnTheRoadCalculatorModal: React.FC<OnTheRoadCalculatorModalProps> = ({
  carsList,
  onClose,
  onSelectCarToDeposit,
}) => {
  const [selectedCarId, setSelectedCarId] = useState<string>(carsList[0]?.id || '');
  const [customPriceVnd, setCustomPriceVnd] = useState<number>(carsList[0]?.priceVnd || 13389000000);
  const [province, setProvince] = useState<'HANOI' | 'HCMC' | 'OTHER'>('HCMC');
  const [includePhysicalInsurance, setIncludePhysicalInsurance] = useState<boolean>(true);

  const selectedCar = carsList.find(c => c.id === selectedCarId);

  const handleCarSelect = (id: string) => {
    setSelectedCarId(id);
    const car = carsList.find(c => c.id === id);
    if (car) {
      setCustomPriceVnd(car.priceVnd);
    }
  };

  // Calculation parameters
  const isElectric = selectedCar?.fuelType === 'EQ_ELECTRIC';
  const taxRate = isElectric ? 0 : (province === 'HANOI' ? 0.12 : 0.10);
  const taxAmount = Math.round(customPriceVnd * taxRate);
  const plateFee = (province === 'HANOI' || province === 'HCMC') ? 20000000 : 1000000;
  const inspectionFee = 90000;
  const roadMaintenance = 1560000;
  const civilInsurance = 480700;
  const physicalInsurance = includePhysicalInsurance ? Math.round(customPriceVnd * 0.014) : 0;

  const totalCost = customPriceVnd + taxAmount + plateFee + inspectionFee + roadMaintenance + civilInsurance + physicalInsurance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                DỰ TOÁN CHI PHÍ LĂN BÁNH XE SANG CHÍNH HÃNG
              </h3>
              <p className="text-[11px] text-zinc-400">
                Tính toán chính xác thuế phí trước bạ, đăng ký biển số theo quy định 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-5 text-xs">
          
          {/* Car selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Chọn dòng xe niêm yết:</label>
              <select
                value={selectedCarId}
                onChange={(e) => handleCarSelect(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E10600]"
              >
                {carsList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({formatVnd(c.priceVnd)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Giá bán xe thực tế (VNĐ):</label>
              <input
                type="number"
                step={50000000}
                value={customPriceVnd}
                onChange={(e) => setCustomPriceVnd(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E10600]"
              />
            </div>
          </div>

          {/* Province selector */}
          <div>
            <label className="block text-zinc-400 mb-2 font-medium">Khu vực đăng ký hộ khẩu / trụ sở doanh nghiệp:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'HANOI', label: 'Hà Nội', desc: 'Trước bạ 12% · Biển 20.000.000đ' },
                { id: 'HCMC', label: 'TP. Hồ Chí Minh', desc: 'Trước bạ 10% · Biển 20.000.000đ' },
                { id: 'OTHER', label: 'Các tỉnh thành khác', desc: 'Trước bạ 10% · Biển 1.000.000đ' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setProvince(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    province === item.id
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${province === item.id ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pure Electric Incentive Banner */}
          {isElectric && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Chính sách ưu đãi: Mẫu xe thuần điện EQ được miễn 100% lệ phí trước bạ! Tiết kiệm hàng trăm triệu đồng.</span>
            </div>
          )}

          {/* Detailed Itemized Costs */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
            <h4 className="font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Bảng kê khai chi phí chi tiết
            </h4>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Giá xe xuất hóa đơn VAT:</span>
              <span className="text-white font-mono tabular-nums">{formatExactVnd(customPriceVnd)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Lệ phí trước bạ ({taxRate * 100}%):</span>
              <span className="text-white font-mono tabular-nums">
                {isElectric ? '0 VNĐ (Miễn 100%)' : formatExactVnd(taxAmount)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Phí cấp biển số xe:</span>
              <span className="text-white font-mono tabular-nums">{formatExactVnd(plateFee)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Phí đăng kiểm phương tiện:</span>
              <span className="text-white font-mono tabular-nums">{formatExactVnd(inspectionFee)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Phí sử dụng đường bộ (1 năm):</span>
              <span className="text-white font-mono tabular-nums">{formatExactVnd(roadMaintenance)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Bảo hiểm trách nhiệm dân sự bắt buộc (1 năm):</span>
              <span className="text-white font-mono tabular-nums">{formatExactVnd(civilInsurance)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
                <input
                  type="checkbox"
                  checked={includePhysicalInsurance}
                  onChange={(e) => setIncludePhysicalInsurance(e.target.checked)}
                  className="rounded border-zinc-700 text-[#E10600] focus:ring-0"
                />
                <span>Bảo hiểm vật chất xe 2 chiều (ước tính 1.4%):</span>
              </label>
              <span className="text-white font-mono tabular-nums">{formatExactVnd(physicalInsurance)}</span>
            </div>
          </div>

          {/* Grand Total Highlight Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-black border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                Tổng chi phí chìa khóa trao tay (Lăn bánh)
              </div>
              <div className="text-xs text-zinc-400">Đã bao gồm tất cả thuế phí theo luật hiện hành</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
                {formatExactVnd(totalCost)}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/20 text-xs text-zinc-300 hover:text-white"
          >
            Đóng bảng tính
          </button>

          {selectedCar && (
            <button
              onClick={() => {
                onClose();
                onSelectCarToDeposit(selectedCar);
              }}
              className="px-6 py-2.5 rounded-lg bg-[#E10600] hover:bg-[#c20500] text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Đặt cọc mẫu xe này ngay
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
