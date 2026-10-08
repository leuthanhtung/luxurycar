import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(mode === 'REGISTER' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(mode === 'REGISTER' ? { name, phone } : {}) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Không thể xác thực tài khoản.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#111111] border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If user is already logged in, show Profile & Logout */}
        {currentUser ? (
          <div className="text-center space-y-5 py-2">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-white/5 mx-auto flex items-center justify-center text-white overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-zinc-300" />
              )}
            </div>

            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-medium mb-2">
                Đang đăng nhập
              </div>
              <h3 className="font-title text-xl text-white font-semibold">{currentUser.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email}</p>
              {currentUser.phone && <p className="text-xs text-zinc-500">{currentUser.phone}</p>}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-full border border-white/30 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white transition-colors"
              >
                Đăng xuất tài khoản
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="space-y-6">
            <div className="text-center">
              {/* Mercedes Logo */}
              <div className="w-10 h-10 mx-auto mb-3 rounded-full border border-white/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.8c4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2-4.52 0-8.2-3.68-8.2-8.2 0-4.52 3.68-8.2 8.2-8.2zm0 1.6l-2.7 7.1H3.8c1.3 2.9 3.8 5.1 6.8 5.9l1.4-7.4 1.4 7.4c3-.8 5.5-3 6.8-5.9h-5.5L12 5.4z" />
                </svg>
              </div>

              <h3 className="font-title text-2xl font-semibold text-white">
                {mode === 'LOGIN' ? 'Đăng nhập Mercedes me' : 'Tạo tài khoản mới'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {mode === 'LOGIN'
                  ? 'Quản lý đơn cọc xe và dịch vụ cá nhân hóa của bạn'
                  : 'Đăng ký nhận quyền lợi thành viên chính hãng'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'REGISTER' && (
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode === 'REGISTER' && (
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Số điện thoại (không bắt buộc)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      autoComplete={mode === 'REGISTER' ? 'new-password' : 'current-password'}
                      placeholder="Tối thiểu 8 ký tự"
                    className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-full bg-[#D11A2A] hover:bg-[#b51221] text-white font-medium text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : mode === 'LOGIN' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
              </button>
            </form>

            <div className="text-center text-xs text-zinc-400 pt-2 border-t border-white/10">
              {mode === 'LOGIN' ? (
                <span>
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => setMode('REGISTER')}
                    className="text-white font-semibold hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </span>
              ) : (
                <span>
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => setMode('LOGIN')}
                    className="text-white font-semibold hover:underline"
                  >
                    Đăng nhập
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
