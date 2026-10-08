import React from 'react';
import { X, Trash2, Heart, ArrowRight } from 'lucide-react';
import { Car } from '../types';
import { formatVnd } from '../utils/format';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistCars: Car[];
  onRemoveWishlist: (carId: string) => void;
  onSelectCar: (car: Car) => void;
  onDepositCar: (car: Car) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistCars,
  onRemoveWishlist,
  onSelectCar,
  onDepositCar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-[#E10600] fill-current" />
              <h3 className="font-display font-bold text-base text-white">
                BỘ SƯU TẬP XE QUAN TÂM ({wishlistCars.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of saved cars */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {wishlistCars.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Quý khách chưa lưu mẫu xe nào.</p>
                <p className="mt-1 text-zinc-400">Nhấn biểu tượng trái tim trên các thẻ xe để lưu lại so sánh.</p>
              </div>
            ) : (
              wishlistCars.map((car) => (
                <div
                  key={car.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3.5 group"
                >
                  <img
                    src={car.images[0]?.imageUrl}
                    alt={car.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4
                      onClick={() => {
                        onClose();
                        onSelectCar(car);
                      }}
                      className="font-semibold text-white truncate cursor-pointer hover:text-zinc-300"
                    >
                      {car.title}
                    </h4>
                    <div className="text-[11px] text-[#FF4A4A] font-bold tabular-nums mt-0.5">
                      {formatVnd(car.priceVnd)}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      {car.horsepower} HP · {car.engine}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onDepositCar(car);
                        }}
                        className="px-2.5 py-1 rounded bg-[#E10600] text-[10px] font-bold uppercase tracking-wider text-white"
                      >
                        Đặt cọc
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectCar(car);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[10px] text-zinc-200"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveWishlist(car.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors self-start"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistCars.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/40">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-colors"
              >
                Tiếp tục xem xe
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
