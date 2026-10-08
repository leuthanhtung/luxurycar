# Stuttgart Motors

Ứng dụng mẫu bán và đặt xe Mercedes-Benz, AMG, Maybach. Dự án dùng React + TypeScript cho giao diện, Express + TypeScript cho API và PostgreSQL để lưu dữ liệu ứng dụng qua Prisma.

## Công nghệ và cấu trúc

### Frontend

- `src/main.tsx` tạo React app; `src/App.tsx` quản lý trang, lọc xe, giỏ yêu thích và gọi API.
- `src/components/` chứa các phần giao diện: thẻ xe, bộ lọc, đăng nhập, đặt cọc, theo dõi đơn, quản trị.
- Ngôn ngữ: TypeScript/TSX. Công cụ: React 19, Vite 8, Tailwind CSS 4, Lucide và Motion.
- Danh sách xe mẫu và kiểu dữ liệu nằm trong `src/data/cars.ts` và `src/types/index.ts`.

### Backend

- `server.ts` chạy Express trên cổng 3000 (hoặc biến `PORT`), đồng thời gắn Vite middleware khi phát triển.
- Các API xe, danh mục, đơn hàng, thanh toán mô phỏng và lịch lái thử đọc/ghi PostgreSQL trong bảng `app_records`. Bảng lưu payload JSON để giữ nguyên cấu trúc API hiện tại; schema quan hệ còn lại trong `prisma/schema.prisma` là thiết kế mở rộng, chưa được các API này sử dụng.
- Đăng ký và đăng nhập dùng bảng `users`; mật khẩu được băm bằng scrypt, phiên đăng nhập dùng cookie HttpOnly ký bằng `AUTH_SECRET`. Trang quản trị và các API ghi/quản lý dữ liệu yêu cầu role `ADMIN`. Thanh toán vẫn mô phỏng; Wishlist vẫn lưu trong `localStorage` của trình duyệt.
- `npm run dev` là lệnh dành cho máy không gặp vấn đề đường dẫn Windows. Vì thư mục này có ký tự `&`, npm script trên một số bản Windows `cmd.exe` không tìm thấy lệnh. Có thể chạy trực tiếp bằng lệnh ở phần dưới.

### Database

- `prisma/schema.prisma` định nghĩa bảng `app_records` cho dữ liệu API và các model quan hệ để mở rộng sau này.
- `.env` cần có `DATABASE_URL`. Tạo/cập nhật cấu trúc database bằng `npx prisma migrate dev`; mở database trong pgAdmin4 để xem bảng và bản ghi.
- Môi trường production phải cấu hình `AUTH_SECRET` bằng chuỗi ngẫu nhiên dài, riêng tư; không commit bí mật này vào Git. Ở môi trường phát triển, server tạo secret tạm và phiên sẽ hết hiệu lực khi server khởi động lại.
- Tạo tài khoản quản trị mới bằng `node .\node_modules\tsx\dist\cli.mjs prisma/create-admin.ts`; script tạo mật khẩu ngẫu nhiên một lần và không ghi mật khẩu rõ vào database. Đăng ký trên website luôn chỉ tạo role `CUSTOMER`.
- `schema.sql` là một DDL riêng, không cần chạy song song khi dùng Prisma Migrate.

## Chạy trên Windows

Cần cài Node.js. Mở PowerShell tại thư mục dự án:

```powershell
npm install
npx prisma migrate dev
npx prisma generate
node .\node_modules\tsx\dist\cli.mjs server.ts
```

Mở http://localhost:3000. Có thể đặt cổng khác trong `.env`, ví dụ `PORT=3001`.

Để tạo bản frontend production và chạy cùng Express:

```powershell
node .\node_modules\vite\bin\vite.js build
node .\node_modules\tsx\dist\cli.mjs server.ts --production
```

## Kiểm tra mã nguồn

```powershell
node .\node_modules\typescript\bin\tsc --noEmit
node .\node_modules\vite\bin\vite.js build
```

Khi khởi động lần đầu, ứng dụng tự nạp danh mục, xe, đơn hàng và lịch lái thử mẫu vào PostgreSQL nếu các collection đó chưa có bản ghi. Các thay đổi sau đó được lưu lại khi tắt máy chủ. Ứng dụng hiện không gọi Gemini API; không cần `GEMINI_API_KEY` để chạy.
