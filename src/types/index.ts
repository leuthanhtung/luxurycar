// Types for Luxury Car Dealership & E-Commerce Platform

export type CarBrand = 'MERCEDES_BENZ' | 'AMG' | 'MAYBACH';

export type BodyType = 'SEDAN' | 'SUV' | 'COUPE' | 'CABRIOLET' | 'ESTATE';

export type FuelType = 'PETROL_BITURBO' | 'DIESEL' | 'EQ_ELECTRIC' | 'PLUG_IN_HYBRID';

export type StockStatus = 'IN_STOCK' | 'RESERVED' | 'TRANSIT' | 'ORDER_CONFIG' | 'SOLD_OUT';

export interface CarImage {
  id: string;
  imageUrl: string;
  viewType: 'EXTERIOR' | 'INTERIOR' | 'DETAIL' | '360_FRAME';
  isPrimary?: boolean;
}

export interface ColorOption {
  name: string;
  code: string;
  hex: string;
  priceDeltaVnd: number;
}

export interface LeatherOption {
  name: string;
  type: string;
  hex: string;
  priceDeltaVnd: number;
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  priceVnd: number;
}

export interface Car {
  id: string;
  title: string;
  slug: string;
  vin: string;
  stockNumber: string;
  brand: CarBrand;
  bodyType: BodyType;
  year: number;
  priceVnd: number; // in VND
  depositMinVnd: number;
  stockStatus: StockStatus;
  isFeatured?: boolean;
  
  // Performance specs
  fuelType: FuelType;
  engine: string;
  horsepower: number;
  torqueNm: number;
  acceleration: number; // 0-100 km/h in seconds
  topSpeedKmh: number;
  transmission: string;
  drivetrain: string;
  fuelEconomy: string;
  electricRangeKm?: number;
  
  // Dimensions & Details
  dimensions: string;
  wheelbase: number;
  curbWeightKg: number;
  seatingCapacity: number;
  
  // Colors & Options
  exteriorColor: string;
  interiorColor: string;
  wheelSpec: string;
  exteriorColors: ColorOption[];
  interiorLeathers: LeatherOption[];
  availablePackages: PackageOption[];
  
  description: string;
  highlights: string[];
  images: CarImage[];
  categoryId: string;
  categoryName: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  brand: CarBrand;
  description: string;
  bannerImage?: string;
  carsCount: number;
}

export type OrderStatus =
  | 'DEPOSIT_PENDING'
  | 'DEPOSITED'
  | 'CONTRACT_SIGNED'
  | 'VEHICLE_READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'VIETQR_BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'VNPAY'
  | 'MOMO'
  | 'STRIPE';

export interface Order {
  id: string;
  orderCode: string;
  trackingCode: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  carId: string;
  car: Car;
  totalAmountVnd: number;
  depositAmountVnd: number;
  remainingAmountVnd: number;
  selectedExterior: ColorOption;
  selectedInterior: LeatherOption;
  selectedPackages: PackageOption[];
  showroomLocation: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestDriveBooking {
  id: string;
  bookingCode: string;
  carId: string;
  carTitle: string;
  carImage: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  driversLicenseNo?: string;
  bookingDate: string;
  timeSlot: string;
  showroomLocation: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface OnTheRoadCost {
  carPriceVnd: number;
  province: 'HANOI' | 'HCMC' | 'OTHER';
  registrationTaxRate: number; // 12% for HN, 10% for others, 0% for pure electric EQ
  registrationTaxVnd: number;
  numberPlateFeeVnd: number; // 20,000,000 for HN & HCMC, 1,000,000 for others
  inspectionFeeVnd: number; // 90,000 VND
  roadMaintenanceFeeVnd: number; // 1,560,000 VND/year
  civilLiabilityInsuranceVnd: number; // 480,700 VND/year
  optionalPhysicalInsuranceVnd: number; // ~ 1.5% car value
  totalOnTheRoadVnd: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  address?: string;
  avatar?: string;
}
