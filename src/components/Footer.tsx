import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="heritage-section" className="bg-[#080808] border-t border-white/10 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-white/5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.8c4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2-4.52 0-8.2-3.68-8.2-8.2 0-4.52 3.68-8.2 8.2-8.2zm0 1.6l-2.7 7.1H3.8c1.3 2.9 3.8 5.1 6.8 5.9l1.4-7.4 1.4 7.4c3-.8 5.5-3 6.8-5.9h-5.5L12 5.4z" />
                </svg>
              </div>
              <span className="font-display font-bold text-base text-white tracking-wider">
                STUTTGART MOTORS
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Đại lý ủy quyền phân phối chính thức các dòng xe Mercedes-Benz, Mercedes-AMG và Mercedes-Maybach tại Việt Nam. Nơi hội tụ tinh hoa chế tác Đức và tiêu chuẩn dịch vụ thượng lưu.
            </p>

            <div className="flex items-center gap-2 text-zinc-300">
              <Award className="w-4 h-4 text-[#E10600]" />
              <span className="font-semibold text-[11px]">Đại lý xuất sắc nhất Đông Nam Á 2025</span>
            </div>
          </div>

          {/* Col 2: Showroom Network */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Hệ thống Showroom VIP
            </h4>
            
            <div className="space-y-3 text-[11px]">
              <div>
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                  Showroom Flagship TP.HCM
                </div>
                <div className="text-zinc-400 pl-5">Số 2 Trường Chinh, P. Tây Thạnh, Tân Phú, TP.HCM</div>
              </div>

              <div>
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                  Showroom Phú Mỹ Hưng
                </div>
                <div className="text-zinc-400 pl-5">811 Nguyễn Văn Linh, P. Tân Phong, Quận 7, TP.HCM</div>
              </div>

              <div>
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                  Showroom Flagship Hà Nội
                </div>
                <div className="text-zinc-400 pl-5">Số 11 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội</div>
              </div>
            </div>
          </div>

          {/* Col 3: Services & Privileges */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Đặc quyền khách hàng
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                Bảo hành 3 năm chính hãng không giới hạn km
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                Dịch vụ cứu hộ Star Assist 24/7 toàn quốc
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                Lounge thương gia phòng chờ độc quyền
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                Hỗ trợ tài chính & Lãi suất ưu đãi Mercedes-Benz Bank
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                Giao xe tại nhà kèm lễ bàn giao hoa & champagne
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotline */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Tổng đài liên hệ VIP
            </h4>

            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Hotline Kinh Doanh: <strong className="text-white font-mono">1800 6868</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Cứu hộ khẩn cấp 24/7: <strong className="text-white font-mono">0909 999 888</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Email: <strong className="text-zinc-200">concierge@stuttgartmotors.vn</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Giờ mở cửa Showroom: 08:00 - 20:00 (Hàng ngày)</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Chứng chỉ an toàn thanh toán
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo chứng VietQR & MBBank Automotive Escrow</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © 2026 STUTTGART MOTORS VIETNAM. Bản quyền thuộc về đại lý phân phối chính thức.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-300 cursor-pointer">Chính sách bảo mật</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-zinc-300 cursor-pointer">Điều khoản đặt cọc</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-zinc-300 cursor-pointer">Quy chế hoạt động</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
