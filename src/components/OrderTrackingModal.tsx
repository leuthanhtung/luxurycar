import React, { useState } from 'react';
import { X, Search, BookmarkCheck, CheckCircle2, Clock, Car, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatExactVnd, formatVnd } from '../utils/format';

interface OrderTrackingModalProps {
  onClose: () => void;
  recentOrders: Order[];
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  onClose,
  recentOrders,
}) => {
  const [searchCode, setSearchCode] = useState(recentOrders[0]?.trackingCode || 'TRK-STU-8819-VN');
  const [foundOrder, setFoundOrder] = useState<Order | null>(recentOrders[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(searchCode.trim())}`);
      const data = await res.json();
      if (data.success) {
        setFoundOrder(data.data);
      } else {
        setFoundOrder(null);
        setErrorMsg('Không tìm thấy thông tin đơn cọc với mã số này. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepActiveIndex = (status: string) => {
    switch (status) {
      case 'DEPOSIT_PENDING':
        return 0;
      case 'DEPOSITED':
        return 1;
      case 'CONTRACT_SIGNED':
        return 2;
      case 'VEHICLE_READY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = foundOrder ? getStepActiveIndex(foundOrder.status) : 0;

  const timelineSteps = [
    { label: 'Khởi tạo cọc', desc: 'Chọn cấu hình xe' },
    { label: 'Bảo chứng giữ xe', desc: 'Thanh toán cọc 200tr' },
    { label: 'Hợp đồng mua bán', desc: 'Hoàn tất thủ tục pháp lý' },
    { label: 'Xe về Showroom', desc: 'Đăng ký & Biển số' },
    { label: 'Bàn giao VIP', desc: 'Trao chìa khóa' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E10600]/20 border border-[#E10600]/50 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4 text-[#FF4A4A]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                TRA CỨU HỢP ĐỒNG & TIẾN ĐỘ BÀN GIAO XE
              </h3>
              <p className="text-[11px] text-zinc-400">
                Theo dõi thời gian thực tiến độ giữ chỗ và chuẩn bị xe của quý khách
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
        <div className="overflow-y-auto p-6 flex-1 space-y-6 text-xs">
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Nhập mã tra cứu (ví dụ: TRK-STU-8819-VN hoặc ORD-MB-8819)"
              className="flex-1 bg-black/60 border border-white/15 rounded-lg px-4 py-2.5 text-white font-mono placeholder:font-sans focus:outline-none focus:border-[#E10600]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#E10600] hover:bg-[#c20500] text-white font-semibold transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Đang tra...' : 'Tra cứu'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300">
              {errorMsg}
            </div>
          )}

          {foundOrder && (
            <div className="space-y-6">
              
              {/* Order Quick Card */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={foundOrder.car.images[0]?.imageUrl}
                  alt={foundOrder.car.title}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-32 h-20 object-cover rounded-lg border border-white/10"
                />
                <div className="flex-1 w-full space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-white text-sm">{foundOrder.car.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                      {foundOrder.status}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    Chủ nhân: <span className="text-white font-medium">{foundOrder.customerName}</span> · ĐT: {foundOrder.customerPhone}
                  </div>
                  <div className="text-zinc-400 font-mono text-[11px]">
                    VIN: {foundOrder.car.vin} · Showroom: {foundOrder.showroomLocation}
                  </div>
                </div>
              </div>

              {/* Delivery Progress Bar Timeline */}
              <div>
                <h4 className="font-semibold text-zinc-300 uppercase tracking-wider mb-4">
                  Tiến độ bàn giao xe độc quyền
                </h4>

                <div className="relative flex items-center justify-between">
                  {/* Connecting track line */}
                  <div className="absolute top-3 left-4 right-4 h-0.5 bg-zinc-800 -z-0" />
                  <div
                    className="absolute top-3 left-4 h-0.5 bg-[#E10600] -z-0 transition-all duration-500"
                    style={{ width: `${(currentStep / (timelineSteps.length - 1)) * 100}%` }}
                  />

                  {timelineSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#E10600] text-white shadow-lg shadow-[#E10600]/40'
                              : 'bg-zinc-900 border border-white/20 text-zinc-500'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px]">{idx + 1}</span>}
                        </div>
                        <div className={`mt-2 font-semibold text-[10px] ${isCurrent ? 'text-white' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {step.label}
                        </div>
                        <div className="text-[9px] text-zinc-500 hidden sm:block">
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase">Tổng giá xe</div>
                  <div className="text-white font-bold tabular-nums text-sm">{formatVnd(foundOrder.totalAmountVnd)}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase">Tiền cọc đã nhận</div>
                  <div className="text-emerald-400 font-bold tabular-nums text-sm">{formatVnd(foundOrder.depositAmountVnd)}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase">Số tiền còn lại</div>
                  <div className="text-zinc-300 font-bold tabular-nums text-sm">{formatVnd(foundOrder.remainingAmountVnd)}</div>
                </div>
              </div>

              {/* Consultant Assistance Hotline */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#E10600]" />
                  <div>
                    <div className="font-semibold text-white">Chuyên viên hỗ trợ riêng: Hoàng Nam</div>
                    <div className="text-[10px] text-zinc-400">Hotline VIP 24/7: 1800 6868 (Nhánh 1)</div>
                  </div>
                </div>
                <a
                  href="tel:18006868"
                  className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  Gọi tư vấn
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            Đóng tra cứu
          </button>
        </div>

      </div>
    </div>
  );
};
