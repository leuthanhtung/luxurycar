import 'dotenv/config';
import express, { Request, Response, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { INITIAL_CARS, CATEGORIES } from './src/data/cars.ts';
import { Car, Order, TestDriveBooking, OnTheRoadCost, UserProfile } from './src/types/index.ts';
import { prisma } from './src/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const scrypt = promisify(scryptCallback);
const authSecret = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production'
  ? (() => { throw new Error('AUTH_SECRET must be configured in production'); })()
  : randomBytes(32).toString('hex'));
const SESSION_COOKIE = 'luxurycar_session';

function createSessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', authSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function getSessionUserId(req: Request): string | null {
  const cookie = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const token = cookie.slice(SESSION_COOKIE.length + 1);
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', authSecret).update(payload).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof data.userId === 'string' && data.exp > Date.now() ? data.userId : null;
  } catch { return null; }
}

function setSessionCookie(res: Response, userId: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${createSessionToken(userId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`);
}

function clearSessionCookie(res: Response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

app.use(express.json());
app.get('/api/db-check', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: 'Đã kết nối PostgreSQL' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ success: false, message: 'Chưa kết nối được PostgreSQL' });
  }
});

// Seed records are copied into PostgreSQL the first time the server starts.
const seedOrders: Order[] = [
  {
    id: 'ord-seed-01',
    orderCode: 'ORD-MB-8819',
    trackingCode: 'TRK-STU-8819-VN',
    userId: 'usr-vip-01',
    customerName: 'Nguyễn Minh Quân',
    customerPhone: '0988776655',
    customerEmail: 'quan.nguyen@viettech.vn',
    carId: 'car-amg-gt63s-e',
    car: INITIAL_CARS[0],
    totalAmountVnd: 13389000000,
    depositAmountVnd: 200000000,
    remainingAmountVnd: 13189000000,
    selectedExterior: INITIAL_CARS[0].exteriorColors[0],
    selectedInterior: INITIAL_CARS[0].interiorLeathers[0],
    selectedPackages: [INITIAL_CARS[0].availablePackages[0]],
    showroomLocation: 'Mercedes-Benz An Du - Hà Nội (Phạm Hùng)',
    status: 'DEPOSITED',
    paymentMethod: 'VIETQR_BANK_TRANSFER',
    paymentStatus: 'SUCCESS',
    paidAt: '2026-10-05T14:30:00Z',
    createdAt: '2026-10-05T14:15:00Z',
    updatedAt: '2026-10-05T14:30:00Z',
  },
  {
    id: 'ord-seed-02',
    orderCode: 'ORD-MAY-9102',
    trackingCode: 'TRK-STU-9102-VN',
    userId: 'usr-vip-02',
    customerName: 'Trần Hoàng Long',
    customerPhone: '0912345678',
    customerEmail: 'long.tran@luxuryholdings.com',
    carId: 'car-maybach-s680',
    car: INITIAL_CARS[1],
    totalAmountVnd: 16840000000,
    depositAmountVnd: 300000000,
    remainingAmountVnd: 16540000000,
    selectedExterior: INITIAL_CARS[1].exteriorColors[0],
    selectedInterior: INITIAL_CARS[1].interiorLeathers[0],
    selectedPackages: [INITIAL_CARS[1].availablePackages[0]],
    showroomLocation: 'Mercedes-Benz Vietnam Star - TP. Hồ Chí Minh (Phú Mỹ Hưng)',
    status: 'CONTRACT_SIGNED',
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'SUCCESS',
    paidAt: '2026-10-04T09:00:00Z',
    createdAt: '2026-10-04T08:45:00Z',
    updatedAt: '2026-10-05T10:00:00Z',
  },
];

const seedTestDrives: TestDriveBooking[] = [
  {
    id: 'td-01',
    bookingCode: 'TD-AMG-771',
    carId: 'car-amg-gt63s-e',
    carTitle: 'Mercedes-AMG GT 63 S E Performance',
    carImage: INITIAL_CARS[0].images[0].imageUrl,
    customerName: 'Lê Thanh Tùng',
    customerPhone: '0909123456',
    customerEmail: 'leuthanhtung05@gmail.com',
    driversLicenseNo: 'B2-790123849',
    bookingDate: '2026-10-10',
    timeSlot: '09:30 - 11:00 (Buổi sáng)',
    showroomLocation: 'Mercedes-Benz Vietnam Star - Trường Chinh, TP.HCM',
    status: 'CONFIRMED',
    notes: 'Khách hàng quan tâm chế độ lái Race Mode & âm thanh thể thao AMG.',
    createdAt: '2026-10-06T08:00:00Z',
  },
  {
    id: 'td-02',
    bookingCode: 'TD-G63-552',
    carId: 'car-amg-g63',
    carTitle: 'Mercedes-AMG G 63 V8 Biturbo',
    carImage: INITIAL_CARS[2].images[0].imageUrl,
    customerName: 'Hoàng Hải Đăng',
    customerPhone: '0983221100',
    customerEmail: 'dang.hoang@investcorp.vn',
    driversLicenseNo: 'B2-88192039',
    bookingDate: '2026-10-12',
    timeSlot: '14:30 - 16:00 (Buổi chiều)',
    showroomLocation: 'Mercedes-Benz Haxaco - Kim Giang, Hà Nội',
    status: 'PENDING_CONFIRMATION',
    notes: 'Yêu cầu chạy thử cung đường dốc để kiểm tra khóa vi sai.',
    createdAt: '2026-10-06T10:30:00Z',
  },
];

const mockCurrentUser: UserProfile = {
  id: 'usr-vip-current',
  name: 'Lê Thanh Tùng',
  email: 'leuthanhtung05@gmail.com',
  phone: '0909123456',
  role: 'CUSTOMER',
  address: 'Khu đô thị Sala, Quận 2, TP. Hồ Chí Minh',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
};

type CollectionName = 'cars' | 'categories' | 'orders' | 'testDrives';

async function readCollection<T>(collection: CollectionName): Promise<T[]> {
  const records = await prisma.appRecord.findMany({
    where: { collection },
    orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
  });
  return records.map(record => record.payload as T);
}

async function saveRecord<T>(collection: CollectionName, id: string, payload: T, position = 0) {
  const json = payload as unknown as Prisma.InputJsonValue;
  return prisma.appRecord.upsert({
    where: { collection_id: { collection, id } },
    create: { collection, id, position, payload: json },
    update: { position, payload: json },
  });
}

async function removeRecord(collection: CollectionName, id: string) {
  return prisma.appRecord.delete({ where: { collection_id: { collection, id } } });
}

async function initializeDatabase() {
  const seedSets: { collection: CollectionName; records: Array<{ id: string }> }[] = [
    { collection: 'categories', records: CATEGORIES },
    { collection: 'cars', records: INITIAL_CARS },
    { collection: 'orders', records: seedOrders },
    { collection: 'testDrives', records: seedTestDrives },
  ];

  for (const set of seedSets) {
    const count = await prisma.appRecord.count({ where: { collection: set.collection } });
    if (count === 0) {
      await prisma.appRecord.createMany({
        data: set.records.map((record, position) => ({
          collection: set.collection,
          id: record.id,
          position,
          payload: record as unknown as Prisma.InputJsonValue,
        })),
      });
    }
  }
}

const asyncRoute = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const requireAdmin: RequestHandler = (req, res, next) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập bằng tài khoản quản trị.' });
  prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    .then(user => user?.role === 'ADMIN'
      ? next()
      : res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng quản trị.' }))
    .catch(next);
};

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// 1. Vehicles RESTful endpoints
app.get('/api/cars', asyncRoute(async (req: Request, res: Response) => {
  const { brand, bodyType, fuelType, minPrice, maxPrice, stockStatus, search, sort } = req.query;
  let result = await readCollection<Car>('cars');

  if (brand && brand !== 'ALL') {
    result = result.filter(c => c.brand === brand);
  }

  if (bodyType && bodyType !== 'ALL') {
    result = result.filter(c => c.bodyType === bodyType);
  }

  if (fuelType && fuelType !== 'ALL') {
    result = result.filter(c => c.fuelType === fuelType);
  }

  if (stockStatus && stockStatus !== 'ALL') {
    result = result.filter(c => c.stockStatus === stockStatus);
  }

  if (minPrice) {
    result = result.filter(c => c.priceVnd >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter(c => c.priceVnd <= Number(maxPrice));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q) ||
        c.engine.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-asc') {
    result.sort((a, b) => a.priceVnd - b.priceVnd);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.priceVnd - a.priceVnd);
  } else if (sort === 'power-desc') {
    result.sort((a, b) => b.horsepower - a.horsepower);
  } else if (sort === 'accel-asc') {
    result.sort((a, b) => a.acceleration - b.acceleration);
  }

  res.json({ success: true, count: result.length, data: result });
}));

app.get('/api/cars/:id', asyncRoute(async (req: Request, res: Response) => {
  const cars = await readCollection<Car>('cars');
  const car = cars.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!car) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  res.json({ success: true, data: car });
}));

// Admin Add Car
app.post('/api/cars', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const cars = await readCollection<Car>('cars');
  const newCar: Car = {
    ...req.body,
    id: `car-custom-${Date.now()}`,
    slug: req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `car-${Date.now()}`,
    vin: req.body.vin || `WDD${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    stockNumber: `STU-VN-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
  };
  await saveRecord('cars', newCar.id, newCar);
  res.status(201).json({ success: true, data: newCar });
}));

// Admin Update Car
app.put('/api/cars/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const cars = await readCollection<Car>('cars');
  const index = cars.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  cars[index] = { ...cars[index], ...req.body };
  await saveRecord('cars', cars[index].id, cars[index], index);
  res.json({ success: true, data: cars[index] });
}));

// Admin Delete Car
app.delete('/api/cars/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const cars = await readCollection<Car>('cars');
  const index = cars.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  const [deleted] = cars.splice(index, 1);
  await removeRecord('cars', deleted.id);
  res.json({ success: true, message: 'Deleted vehicle', data: deleted });
}));

// 2. Categories
app.get('/api/categories', asyncRoute(async (_req: Request, res: Response) => {
  const [categories, cars] = await Promise.all([
    readCollection<(typeof CATEGORIES)[number]>('categories'),
    readCollection<Car>('cars'),
  ]);
  const data = categories.map(category => ({
    ...category,
    carsCount: cars.filter(car => car.categoryId === category.id).length,
  }));
  res.json({ success: true, data });
}));

// 3. Online Deposit & Orders
app.post('/api/orders', asyncRoute(async (req: Request, res: Response) => {
  const {
    carId,
    customerName,
    customerPhone,
    customerEmail,
    selectedExterior,
    selectedInterior,
    selectedPackages,
    showroomLocation,
    paymentMethod,
  } = req.body;

  const cars = await readCollection<Car>('cars');
  const car = cars.find(c => c.id === carId);
  if (!car) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }

  // Calculate total with selected options
  let totalAmountVnd = car.priceVnd;
  if (selectedExterior?.priceDeltaVnd) totalAmountVnd += selectedExterior.priceDeltaVnd;
  if (selectedInterior?.priceDeltaVnd) totalAmountVnd += selectedInterior.priceDeltaVnd;
  if (selectedPackages && Array.isArray(selectedPackages)) {
    selectedPackages.forEach((pkg: any) => {
      if (pkg.priceVnd) totalAmountVnd += pkg.priceVnd;
    });
  }

  const depositAmountVnd = car.depositMinVnd || 200000000;
  const remainingAmountVnd = totalAmountVnd - depositAmountVnd;
  const randCode = Math.floor(1000 + Math.random() * 9000);

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderCode: `ORD-${car.brand.substring(0, 3)}-${randCode}`,
    trackingCode: `TRK-STU-${randCode}-VN`,
    userId: mockCurrentUser.id,
    customerName: customerName || mockCurrentUser.name,
    customerPhone: customerPhone || mockCurrentUser.phone,
    customerEmail: customerEmail || mockCurrentUser.email,
    carId,
    car,
    totalAmountVnd,
    depositAmountVnd,
    remainingAmountVnd,
    selectedExterior: selectedExterior || car.exteriorColors[0],
    selectedInterior: selectedInterior || car.interiorLeathers[0],
    selectedPackages: selectedPackages || [],
    showroomLocation: showroomLocation || 'Mercedes-Benz An Du - Hà Nội (Phạm Hùng)',
    status: 'DEPOSIT_PENDING',
    paymentMethod: paymentMethod || 'VIETQR_BANK_TRANSFER',
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveRecord('orders', newOrder.id, newOrder);
  res.status(201).json({ success: true, data: newOrder });
}));

app.get('/api/orders', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const orders = await readCollection<Order>('orders');
  res.json({ success: true, count: orders.length, data: orders });
}));

app.get('/api/orders/:code', asyncRoute(async (req: Request, res: Response) => {
  const orders = await readCollection<Order>('orders');
  const code = req.params.code;
  const order = orders.find(
    o => o.id === code || o.orderCode === code || o.trackingCode === code
  );
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order reservation not found' });
  }
  res.json({ success: true, data: order });
}));

// Simulate Payment Webhook / Confirmation
app.post('/api/orders/:id/payment', asyncRoute(async (req: Request, res: Response) => {
  const orders = await readCollection<Order>('orders');
  const order = orders.find(o => o.id === req.params.id || o.orderCode === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.paymentStatus = 'SUCCESS';
  order.status = 'DEPOSITED';
  order.paidAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  const orderPosition = orders.findIndex(item => item.id === order.id);
  await saveRecord('orders', order.id, order, orderPosition);

  // Mark the car as reserved in inventory
  const cars = await readCollection<Car>('cars');
  const car = cars.find(c => c.id === order.carId);
  if (car) {
    car.stockStatus = 'RESERVED';
    await saveRecord('cars', car.id, car, cars.findIndex(item => item.id === car.id));
  }

  res.json({
    success: true,
    message: 'Deposit payment received and confirmed successfully.',
    data: order,
    certificate: {
      certificateNumber: `STU-CERT-${order.orderCode}`,
      vin: order.car.vin,
      depositAmount: order.depositAmountVnd,
      remainingAmount: order.remainingAmountVnd,
      clientName: order.customerName,
      deliveryShowroom: order.showroomLocation,
      timestamp: order.paidAt,
    },
  });
}));

app.put('/api/orders/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const orders = await readCollection<Order>('orders');
  const index = orders.findIndex(order => order.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  orders[index] = { ...orders[index], ...req.body, updatedAt: new Date().toISOString() };
  await saveRecord('orders', orders[index].id, orders[index], index);
  res.json({ success: true, data: orders[index] });
}));

// 4. Test Drive Bookings
app.post('/api/test-drives', asyncRoute(async (req: Request, res: Response) => {
  const {
    carId,
    customerName,
    customerPhone,
    customerEmail,
    driversLicenseNo,
    bookingDate,
    timeSlot,
    showroomLocation,
    notes,
  } = req.body;

  const cars = await readCollection<Car>('cars');
  const car = cars.find(c => c.id === carId);
  const newBooking: TestDriveBooking = {
    id: `td-${Date.now()}`,
    bookingCode: `TD-${car ? car.brand.substring(0, 3) : 'MB'}-${Math.floor(100 + Math.random() * 900)}`,
    carId,
    carTitle: car ? car.title : 'Mercedes-Benz Luxury Model',
    carImage: car?.images[0]?.imageUrl || '',
    customerName,
    customerPhone,
    customerEmail,
    driversLicenseNo,
    bookingDate,
    timeSlot,
    showroomLocation,
    status: 'CONFIRMED', // Instant confirmation with VIP concierge
    notes,
    createdAt: new Date().toISOString(),
  };

  await saveRecord('testDrives', newBooking.id, newBooking);
  res.status(201).json({ success: true, data: newBooking });
}));

app.get('/api/test-drives', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const testDrives = await readCollection<TestDriveBooking>('testDrives');
  res.json({ success: true, count: testDrives.length, data: testDrives });
}));

app.put('/api/test-drives/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const testDrives = await readCollection<TestDriveBooking>('testDrives');
  const booking = testDrives.find(t => t.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  if (req.body.status) booking.status = req.body.status;
  if (req.body.notes) booking.notes = req.body.notes;
  await saveRecord('testDrives', booking.id, booking, testDrives.findIndex(item => item.id === booking.id));
  res.json({ success: true, data: booking });
}));

// 5. On-the-road cost estimation calculator API
app.post('/api/calculator/on-the-road', (req: Request, res: Response) => {
  const { carPriceVnd, province, isElectric } = req.body;
  const price = Number(carPriceVnd) || 0;

  let taxRate = 0.10; // Default 10%
  let plateFee = 1000000; // 1 million VND other provinces

  if (province === 'HANOI') {
    taxRate = 0.12; // 12% in Hanoi
    plateFee = 20000000; // 20 million VND
  } else if (province === 'HCMC') {
    taxRate = 0.10; // 10% in HCMC
    plateFee = 20000000; // 20 million VND
  }

  // Pure electric vehicles exempt 100% registration tax in Vietnam
  if (isElectric) {
    taxRate = 0;
  }

  const registrationTaxVnd = Math.round(price * taxRate);
  const inspectionFeeVnd = 90000;
  const roadMaintenanceFeeVnd = 1560000; // 1 year
  const civilLiabilityInsuranceVnd = 480700; // Under 6 seats
  const optionalPhysicalInsuranceVnd = Math.round(price * 0.014); // 1.4% comprehensive insurance

  const totalOnTheRoadVnd =
    price +
    registrationTaxVnd +
    plateFee +
    inspectionFeeVnd +
    roadMaintenanceFeeVnd +
    civilLiabilityInsuranceVnd +
    optionalPhysicalInsuranceVnd;

  const result: OnTheRoadCost = {
    carPriceVnd: price,
    province: province || 'HCMC',
    registrationTaxRate: taxRate,
    registrationTaxVnd,
    numberPlateFeeVnd: plateFee,
    inspectionFeeVnd,
    roadMaintenanceFeeVnd,
    civilLiabilityInsuranceVnd,
    optionalPhysicalInsuranceVnd,
    totalOnTheRoadVnd,
  };

  res.json({ success: true, data: result });
});

// 6. Admin aggregated analytics
app.get('/api/admin/stats', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const [orders, cars, testDrives] = await Promise.all([
    readCollection<Order>('orders'),
    readCollection<Car>('cars'),
    readCollection<TestDriveBooking>('testDrives'),
  ]);
  const totalRevenueDeposited = orders
    .filter(o => o.paymentStatus === 'SUCCESS')
    .reduce((acc, cur) => acc + cur.depositAmountVnd, 0);

  const totalCarValueSold = orders
    .filter(o => o.paymentStatus === 'SUCCESS')
    .reduce((acc, cur) => acc + cur.totalAmountVnd, 0);

  const inStockCount = cars.filter(c => c.stockStatus === 'IN_STOCK').length;
  const reservedCount = cars.filter(c => c.stockStatus === 'RESERVED').length;

  res.json({
    success: true,
    data: {
      totalRevenueDeposited,
      totalCarValueSold,
      totalOrders: orders.length,
      successfulDeposits: orders.filter(o => o.paymentStatus === 'SUCCESS').length,
      conversionRate: '42.8%',
      inventory: {
        total: cars.length,
        inStock: inStockCount,
        reserved: reservedCount,
        transit: cars.filter(c => c.stockStatus === 'TRANSIT').length,
      },
      testDrives: {
        total: testDrives.length,
        confirmed: testDrives.filter(t => t.status === 'CONFIRMED').length,
        pending: testDrives.filter(t => t.status === 'PENDING_CONFIRMATION').length,
      },
      recentOrders: orders.slice(0, 5),
    },
  });
}));

// 7. Auth endpoints
app.post('/api/auth/register', asyncRoute(async (req: Request, res: Response) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên, email hợp lệ và mật khẩu từ 8 đến 128 ký tự.' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, passwordHash: `scrypt$${salt}$${derivedKey.toString('hex')}` },
    select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
  });
  setSessionCookie(res, user.id);
  res.status(201).json({ success: true, user });
}));

app.post('/api/auth/login', asyncRoute(async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = await prisma.user.findUnique({ where: { email } });
  const [algorithm, salt, storedHash] = user?.passwordHash.split('$') || [];
  if (!user || algorithm !== 'scrypt' || !salt || !storedHash) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
  }
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(storedHash, 'hex');
  if (expected.length !== derivedKey.length || !timingSafeEqual(expected, derivedKey)) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
  }
  setSessionCookie(res, user.id);
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role },
  });
}));

app.get('/api/auth/me', asyncRoute(async (req: Request, res: Response) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
  });
  if (!user) return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ.' });
  res.json({ success: true, user });
}));

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// Vite Middleware in Dev & Static Serving in Prod
// ----------------------------------------------------------------------------
app.use((error: unknown, _req: Request, res: Response, next: (error?: unknown) => void) => {
  console.error('API request failed:', error);
  if (res.headersSent) return next(error);
  res.status(500).json({ success: false, message: 'Lỗi xử lý yêu cầu trên máy chủ' });
});

async function startServer() {
  await initializeDatabase();

  if (process.env.NODE_ENV === 'production' || process.argv.includes('--production')) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STUTTGART MOTORS server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
