import React, { useState } from 'react';
import { X, Check, ShieldCheck, QrCode, CreditCard, Building2, Download, Printer, Copy, AlertCircle, ArrowRight } from 'lucide-react';
import { Car, ColorOption, LeatherOption, PackageOption, PaymentMethod, Order } from '../types';
import { formatVnd, formatExactVnd, formatUsd } from '../utils/format';

interface DepositCheckoutModalProps {
  car: Car | null;
  config: {
    exterior: ColorOption;
    interior: LeatherOption;
    packages: PackageOption[];
    totalPriceVnd: number;
  } | null;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const DepositCheckoutModal: React.FC<DepositCheckoutModalProps> = ({
  car,
  config,
  onClose,
  onOrderCompleted,
}) => {
  if (!car) return null;

  const [step, setStep] = useState<'INFO' | 'PAYMENT' | 'CERTIFICATE'>('INFO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Customer form inputs
  const [customerName, setCustomerName] = useState('Lê Thanh Tùng');
  const [customerPhone, setCustomerPhone] = useState('0909123456');
  const [customerEmail, setCustomerEmail] = useState('leuthanhtung05@gmail.com');
  const [idCardNumber, setIdCardNumber] = useState('079095018274');
  const [showroomLocation, setShowroomLocation] = useState('Mercedes-Benz Vietnam Star - Trường Chinh, TP.HCM');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR_BANK_TRANSFER');
  const [cardNumber, setCardNumber] = useState('4210 8820 9940 1823');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Created Order result
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const totalPrice = config?.totalPriceVnd || car.priceVnd;
  const depositAmount = car.depositMinVnd || 200000000;
  const remainingAmount = totalPrice - depositAmount;

  // Generate dynamic QR code URL
  const transferMemo = createdOrder ? createdOrder.orderCode : `STU-DEP-${car.vin.slice(-4)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `00020101021238540010A00000072701240006970422011009091234560208QRIBFTTA5303704540${depositAmount}5802VN62180814${transferMemo}6304`
  )}`;

  const handleCreateOrderAndProceedToPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car.id,
          customerName,
          customerPhone,
          customerEmail,
          selectedExterior: config?.exterior,
          selectedInterior: config?.interior,
          selectedPackages: config?.packages,
          showroomLocation,
          paymentMethod,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCreatedOrder(data.data);
        setStep('PAYMENT');
      }
    } catch (err) {
      console.error('Error creating order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdOrder) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${createdOrder.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setCreatedOrder(data.data);
        setStep('CERTIFICATE');
        onOrderCompleted(data.data);
      }
    } catch (err) {
      console.error('Payment confirmation error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E10600]/20 border border-[#E10600]/50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#FF4A4A]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {step === 'CERTIFICATE' ? 'XÁC NHẬN ĐẶT CỌC THÀNH CÔNG' : 'QUY TRÌNH ĐẶT CỌC GIỮ XE TRỰC TUYẾN'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Hệ thống xác thực độc quyền Stuttgart Motors Vietnam
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          
          {/* STEP 1: Customer Information & Contract Details */}
          {step === 'INFO' && (
            <div className="space-y-5">
              
              {/* Vehicle Reservation Summary Card */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={car.images[0]?.imageUrl}
                  alt={car.title}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-36 h-24 object-cover rounded-lg border border-white/10"
                />
                <div className="flex-1 w-full text-xs">
                  <div className="font-display font-bold text-base text-white">{car.title}</div>
                  <div className="text-zinc-400 mt-0.5">Số khung VIN: <span className="text-zinc-200 font-mono font-medium">{car.vin}</span></div>
                  <div className="text-zinc-400">Màu sơn đã chọn: <span className="text-white">{config?.exterior.name || car.exteriorColor}</span></div>
                  <div className="mt-2 flex items-baseline justify-between border-t border-white/5 pt-2">
                    <span className="text-zinc-400">Tiền cọc giữ xe:</span>
                    <span className="text-base font-bold font-display text-[#FF4A4A] tabular-nums">
                      {formatExactVnd(depositAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Thông tin chủ nhân đứng tên hợp đồng mua xe
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Họ và tên khách hàng *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E10600]"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E10600]"
                      placeholder="0909xxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Email nhận chứng thư điện tử *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E10600]"
                      placeholder="example@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Số CCCD / Hộ chiếu (Làm hợp đồng) *</label>
                    <input
                      type="text"
                      value={idCardNumber}
                      onChange={(e) => setIdCardNumber(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E10600]"
                      placeholder="079095018274"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-xs">Showroom Mercedes-Benz nhận bàn giao xe *</label>
                  <select
                    value={showroomLocation}
                    onChange={(e) => setShowroomLocation(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E10600]"
                  >
                    <option value="Mercedes-Benz Vietnam Star - Trường Chinh, TP.HCM">Mercedes-Benz Vietnam Star - Trường Chinh, TP.HCM</option>
                    <option value="Mercedes-Benz Vietnam Star - Phú Mỹ Hưng, Q.7, TP.HCM">Mercedes-Benz Vietnam Star - Phú Mỹ Hưng, Q.7, TP.HCM</option>
                    <option value="Mercedes-Benz An Du - Phạm Hùng, Hà Nội">Mercedes-Benz An Du - Phạm Hùng, Hà Nội</option>
                    <option value="Mercedes-Benz Haxaco - Kim Giang, Hà Nội">Mercedes-Benz Haxaco - Kim Giang, Hà Nội</option>
                    <option value="Mercedes-Benz An Du - Đà Nẵng">Mercedes-Benz An Du - Đà Nẵng</option>
                  </select>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/10 text-[11px] text-zinc-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  Tiền đặt cọc sẽ được bảo chứng tại tài khoản ngân hàng chính thức của đại lý và trừ trực tiếp vào giá trị hợp đồng khi bàn giao xe. Quý khách có thể đổi màu xe hoặc phiên bản trong vòng 07 ngày làm việc.
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Payment Gateway Selection & Instant Transfer QR */}
          {step === 'PAYMENT' && createdOrder && (
            <div className="space-y-5">
              
              {/* Order Reference Header */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Mã đơn giữ chỗ: </span>
                  <span className="font-mono font-bold text-white text-sm">{createdOrder.orderCode}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Mã tra cứu: </span>
                  <span className="font-mono font-semibold text-[#FF4A4A]">{createdOrder.trackingCode}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                  Phương thức thanh toán tiền cọc
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setPaymentMethod('VIETQR_BANK_TRANSFER')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                      paymentMethod === 'VIETQR_BANK_TRANSFER'
                        ? 'bg-[#E10600]/15 border-[#E10600] text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Chuyển khoản VietQR</div>
                      <div className="text-[10px] text-zinc-400">Xác thực tự động qua ngân hàng 24/7</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'bg-[#E10600]/15 border-[#E10600] text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Thẻ Quốc Tế Visa / Master</div>
                      <div className="text-[10px] text-zinc-400">Bảo mật chuẩn PCI DSS Level 1</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Method 1: VietQR Bank Transfer details */}
              {paymentMethod === 'VIETQR_BANK_TRANSFER' && (
                <div className="p-5 rounded-xl bg-black/60 border border-white/10 flex flex-col md:flex-row items-center gap-6">
                  {/* QR Box */}
                  <div className="p-3 bg-white rounded-xl shadow-lg shrink-0 text-center">
                    <img
                      src={qrCodeUrl}
                      alt="VietQR Chuyển khoản"
                      className="w-44 h-44 object-contain mx-auto"
                    />
                    <div className="text-[10px] text-zinc-800 font-semibold mt-1">
                      Quét mã với mọi ứng dụng Banking
                    </div>
                  </div>

                  {/* Transfer bank details */}
                  <div className="flex-1 w-full text-xs space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Ngân hàng thụ hưởng:</span>
                      <span className="text-white font-semibold">MBBank (Ngân hàng Quân Đội)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Số tài khoản đại lý:</span>
                      <span className="text-white font-mono font-bold tracking-wider">8888 9999 6688</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Tên đơn vị thụ hưởng:</span>
                      <span className="text-white font-semibold">CTCP STUTTGART MOTORS VIETNAM</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Số tiền cọc:</span>
                      <span className="text-[#FF4A4A] font-bold font-display text-sm tabular-nums">
                        {formatExactVnd(depositAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-400">Nội dung chuyển khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-mono font-bold">{transferMemo}</span>
                        <button
                          onClick={() => copyToClipboard(transferMemo)}
                          className="p-1 hover:text-white text-zinc-400 transition-colors"
                          title="Sao chép nội dung"
                        >
                          {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Method 2: Credit Card Simulator */}
              {paymentMethod === 'CREDIT_CARD' && (
                <div className="p-5 rounded-xl bg-black/60 border border-white/10 space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Số thẻ tín dụng / ghi nợ</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/80 border border-white/15 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1">Ngày hết hạn (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Mã bảo mật CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-black/80 border border-white/15 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: Electronic Deposit Certificate (Giấy xác nhận đặt cọc điện tử) */}
          {step === 'CERTIFICATE' && createdOrder && (
            <div className="space-y-4">
              
              {/* Official Certificate Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-[#121212] border-2 border-white/20 shadow-2xl relative overflow-hidden">
                
                {/* Certificate Background Watermark */}
                <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-64 h-64 text-white" />
                </div>

                <div className="relative z-10 text-center pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                    <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-white tracking-wide uppercase">
                    CHỨNG THƯ XÁC NHẬN ĐẶT CỌC XE ĐIỆN TỬ
                  </h3>
                  <p className="text-xs text-zinc-400">
                    STUTTGART MOTORS OFFICIAL CERTIFICATE OF VEHICLE RESERVATION
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Mã hợp đồng đơn đặt:</span>
                    <span className="font-mono font-bold text-white text-sm">{createdOrder.orderCode}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Mã tra cứu tiến độ bàn giao:</span>
                    <span className="font-mono font-bold text-[#FF4A4A] text-sm">{createdOrder.trackingCode}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Khách hàng đứng tên:</span>
                    <span className="text-white font-semibold">{createdOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Dòng xe đặt giữ chỗ:</span>
                    <span className="text-white font-semibold">{createdOrder.car.title}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Số khung VIN bảo chứng:</span>
                    <span className="font-mono text-zinc-300">{createdOrder.car.vin}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Showroom nhận xe:</span>
                    <span className="text-zinc-300">{createdOrder.showroomLocation}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Số tiền cọc đã thanh toán:</span>
                    <span className="font-display font-bold text-emerald-400 text-base">
                      {formatExactVnd(createdOrder.depositAmountVnd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Thời gian thanh toán:</span>
                    <span className="text-zinc-300">
                      {new Date(createdOrder.paidAt || Date.now()).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Seal & Status */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-semibold uppercase">Trạng thái: Đã bảo chứng vị trí xe</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Hệ thống: E-COMMERCE MERCEDES VIETNAM
                  </div>
                </div>

              </div>

              {/* Actions for Certificate */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  In chứng thư
                </button>
                <button
                  onClick={() => {
                    alert(`Đã lưu mã hợp đồng ${createdOrder.trackingCode} vào danh sách đơn hàng của bạn!`);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-lg bg-[#E10600] hover:bg-[#c20500] text-xs font-bold uppercase tracking-wider text-white transition-colors"
                >
                  Hoàn tất & Về trang chủ
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        {step !== 'CERTIFICATE' && (
          <div className="px-6 py-4 border-t border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              Tổng giá trị xe: <span className="text-white font-semibold">{formatVnd(totalPrice)}</span>
            </div>

            <div className="flex items-center gap-3">
              {step === 'PAYMENT' && (
                <button
                  onClick={() => setStep('INFO')}
                  className="px-4 py-2 rounded-lg border border-white/20 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  Quay lại thông tin
                </button>
              )}

              {step === 'INFO' ? (
                <button
                  onClick={handleCreateOrderAndProceedToPayment}
                  disabled={isSubmitting || !customerName || !customerPhone}
                  className="px-6 py-2.5 rounded-lg bg-[#E10600] hover:bg-[#c20500] disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-[#E10600]/30 flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Đang khởi tạo...' : 'Tiếp tục thanh toán cọc'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Đang xác thực...' : 'Xác nhận đã chuyển tiền cọc'}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
