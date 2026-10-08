-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'SALES_CONSULTANT', 'DEALERSHIP_MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Brand" AS ENUM ('MERCEDES_BENZ', 'AMG', 'MAYBACH');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SEDAN', 'SUV', 'COUPE', 'CABRIOLET', 'ESTATE');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL_BITURBO', 'DIESEL', 'EQ_ELECTRIC', 'PLUG_IN_HYBRID');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AMG_SPEEDSHIFT_MCT_9G', 'G_TRONIC_9G', 'DIRECT_DRIVE_1SPEED');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'RESERVED', 'TRANSIT', 'ORDER_CONFIG', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'DEPOSIT_PENDING', 'DEPOSITED', 'CONTRACT_SIGNED', 'VEHICLE_READY', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('VIETQR_BANK_TRANSFER', 'VNPAY', 'MOMO', 'STRIPE', 'CASH_AT_SHOWROOM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "idCardNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" "Brand" NOT NULL DEFAULT 'MERCEDES_BENZ',
    "description" TEXT,
    "banner_image" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "stock_number" TEXT NOT NULL,
    "brand" "Brand" NOT NULL DEFAULT 'MERCEDES_BENZ',
    "body_type" "BodyType" NOT NULL DEFAULT 'SEDAN',
    "year" INTEGER NOT NULL DEFAULT 2025,
    "price_vnd" BIGINT NOT NULL,
    "deposit_min_vnd" BIGINT NOT NULL DEFAULT 100000000,
    "stock_status" "StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "fuel_type" "FuelType" NOT NULL DEFAULT 'PETROL_BITURBO',
    "engine" TEXT NOT NULL,
    "horsepower" INTEGER NOT NULL,
    "torqueNm" INTEGER NOT NULL,
    "acceleration" DOUBLE PRECISION NOT NULL,
    "topSpeedKmh" INTEGER NOT NULL,
    "transmission" "Transmission" NOT NULL DEFAULT 'AMG_SPEEDSHIFT_MCT_9G',
    "drivetrain" TEXT NOT NULL DEFAULT '4MATIC+ All-Wheel Drive',
    "fuelEconomy" TEXT,
    "electric_range_km" INTEGER,
    "dimensions" TEXT,
    "wheelbase" INTEGER,
    "curb_weight_kg" INTEGER,
    "seating_capacity" INTEGER NOT NULL DEFAULT 5,
    "exterior_color" TEXT NOT NULL,
    "interior_color" TEXT NOT NULL,
    "wheel_spec" TEXT,
    "description" TEXT,
    "highlights" TEXT[],
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_images" (
    "id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "view_type" TEXT NOT NULL DEFAULT 'EXTERIOR',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_code" TEXT NOT NULL,
    "tracking_code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_amount_vnd" BIGINT NOT NULL,
    "deposit_amount_vnd" BIGINT NOT NULL,
    "remaining_amount_vnd" BIGINT NOT NULL,
    "selected_exterior" TEXT,
    "selected_interior" TEXT,
    "selected_packages" TEXT[],
    "showroom_location" TEXT NOT NULL,
    "delivery_notes" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'DEPOSIT_PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "unit_price_vnd" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'VIETQR_BANK_TRANSFER',
    "amount_vnd" BIGINT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_url" TEXT,
    "qr_code_url" TEXT,
    "raw_response" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_drive_bookings" (
    "id" TEXT NOT NULL,
    "booking_code" TEXT NOT NULL,
    "user_id" TEXT,
    "car_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "drivers_license_no" TEXT,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "time_slot" TEXT NOT NULL,
    "showroom_location" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "consultant_notes" TEXT,
    "customer_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_drive_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cars_slug_key" ON "cars"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cars_vin_key" ON "cars"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "cars_stock_number_key" ON "cars"("stock_number");

-- CreateIndex
CREATE INDEX "cars_brand_stock_status_idx" ON "cars"("brand", "stock_status");

-- CreateIndex
CREATE INDEX "cars_price_vnd_idx" ON "cars"("price_vnd");

-- CreateIndex
CREATE INDEX "cars_body_type_idx" ON "cars"("body_type");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "orders"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tracking_code_key" ON "orders"("tracking_code");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_drive_bookings_booking_code_key" ON "test_drive_bookings"("booking_code");

-- CreateIndex
CREATE INDEX "test_drive_bookings_booking_date_showroom_location_idx" ON "test_drive_bookings"("booking_date", "showroom_location");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_car_id_key" ON "wishlists"("user_id", "car_id");

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_drive_bookings" ADD CONSTRAINT "test_drive_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_drive_bookings" ADD CONSTRAINT "test_drive_bookings_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
