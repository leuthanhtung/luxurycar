// Formatting utilities for Luxury Automotive Platform

export function formatVnd(amount: number): string {
  if (amount >= 1000000000) {
    const billions = amount / 1000000000;
    return `${billions.toFixed(billions % 1 === 0 ? 0 : 3)} Tỷ VNĐ`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatExactVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

export function formatUsd(amountVnd: number): string {
  const usd = Math.round(amountVnd / 25400);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

export function getBrandBadge(brand: string): { label: string; bg: string; text: string } {
  switch (brand) {
    case 'AMG':
      return { label: 'MERCEDES-AMG', bg: 'bg-[#E10600]/20 border border-[#E10600]/40', text: 'text-[#FF4A4A]' };
    case 'MAYBACH':
      return { label: 'MERCEDES-MAYBACH', bg: 'bg-[#C5A059]/20 border border-[#C5A059]/40', text: 'text-[#E5C378]' };
    default:
      return { label: 'MERCEDES-BENZ', bg: 'bg-white/10 border border-white/20', text: 'text-zinc-200' };
  }
}

export function getStockStatusInfo(status: string): { label: string; color: string; dot: string } {
  switch (status) {
    case 'IN_STOCK':
      return { label: 'Sẵn sàng giao xe', color: 'text-emerald-400', dot: 'bg-emerald-500' };
    case 'RESERVED':
      return { label: 'Đã nhận đặt cọc', color: 'text-amber-400', dot: 'bg-amber-500' };
    case 'TRANSIT':
      return { label: 'Đang vận chuyển về cảng', color: 'text-blue-400', dot: 'bg-blue-500' };
    case 'ORDER_CONFIG':
      return { label: 'Đặt riêng từ nhà máy Đức', color: 'text-purple-400', dot: 'bg-purple-500' };
    case 'SOLD_OUT':
      return { label: 'Đã hoàn tất bàn giao', color: 'text-zinc-500', dot: 'bg-zinc-600' };
    default:
      return { label: 'Liên hệ tư vấn', color: 'text-zinc-400', dot: 'bg-zinc-400' };
  }
}
