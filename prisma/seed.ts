import { PrismaClient, Brand, BodyType, FuelType, Transmission, StockStatus } from '@prisma/client';
import { CATEGORIES, INITIAL_CARS } from '../src/data/cars';

const prisma = new PrismaClient();

function toBigInt(value: any, fallback: number = 0): bigint {
  if (value === undefined || value === null) return BigInt(fallback);
  try {
    return BigInt(value);
  } catch {
    return BigInt(fallback);
  }
}

function mapTransmission(trans: string): Transmission {
  if (trans.includes('MCT')) return Transmission.AMG_SPEEDSHIFT_MCT_9G;
  if (trans.includes('9G')) return Transmission.G_TRONIC_9G;
  return Transmission.AMG_SPEEDSHIFT_MCT_9G;
}

async function main() {
  console.log('🔄 1. Đang dọn sạch dữ liệu cũ trong pgAdmin 4...');
  await prisma.carImage.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🔄 2. Nạp các phân khúc xe cao cấp (Categories)...');
  for (const cat of CATEGORIES) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        brand: cat.brand as Brand,
        description: cat.description || '',
      }
    });
  }

  console.log(`🔄 3. Bơm ${INITIAL_CARS.length} chiếc xe sang vào PostgreSQL...`);
  for (const car of INITIAL_CARS) {
    const createdCar = await prisma.car.create({
      data: {
        id: car.id,
        title: car.title,
        slug: car.slug,
        vin: car.vin,
        stockNumber: car.stockNumber,
        brand: car.brand as Brand,
        bodyType: car.bodyType as BodyType,
        year: car.year,
        priceVnd: toBigInt(car.priceVnd, 13000000000),
        depositMinVnd: toBigInt(car.depositMinVnd, 200000000),
        stockStatus: (car.stockStatus as StockStatus) || StockStatus.IN_STOCK,
        isFeatured: car.isFeatured || false,
        fuelType: car.fuelType as FuelType,
        engine: car.engine,
        horsepower: car.horsepower,
        torqueNm: car.torqueNm,
        acceleration: car.acceleration,
        topSpeedKmh: car.topSpeedKmh,
        transmission: mapTransmission(car.transmission),
        drivetrain: car.drivetrain,
        fuelEconomy: car.fuelEconomy,
        electricRangeKm: car.electricRangeKm,
        dimensions: car.dimensions,
        wheelbase: car.wheelbase,
        curbWeightKg: car.curbWeightKg,
        seatingCapacity: car.seatingCapacity,
        exteriorColor: car.exteriorColor,
        interiorColor: car.interiorColor,
        wheelSpec: car.wheelSpec,
        description: car.description,
        highlights: car.highlights,
        categoryId: car.categoryId,
      }
    });

    // Tự động bóc tách mảng ảnh để lưu vào bảng car_images
    if (car.images && Array.isArray(car.images)) {
      for (let i = 0; i < car.images.length; i++) {
        const img = car.images[i];
        await prisma.carImage.create({
          data: {
            id: img.id || undefined,
            carId: createdCar.id,
            imageUrl: img.imageUrl,
            viewType: img.viewType || 'EXTERIOR',
            sortOrder: i,
            isPrimary: img.isPrimary || i === 0,
          }
        });
      }
    }
  }

  console.log('✅ THÀNH CÔNG: Toàn bộ siêu xe đã nằm gọn gàng trong pgAdmin 4!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi tiến trình:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // <-- Chỉ để dấu $ phương thức chuẩn của Prisma
  });
