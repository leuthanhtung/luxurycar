import 'dotenv/config';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin@stuttgartmotors.vn';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new Error(`Tài khoản ${email} đã tồn tại. Không thay đổi tài khoản để tránh ghi đè thông tin.`);
  }

  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64) as Buffer;
  await prisma.user.create({
    data: {
      email,
      name: 'Quản trị viên Stuttgart Motors',
      role: 'ADMIN',
      passwordHash: `scrypt$${salt}$${hash.toString('hex')}`,
    },
  });

  console.log(`Tạo tài khoản quản trị thành công.\nEmail: ${email}\nMật khẩu tạm thời: ${password}\nHãy lưu mật khẩu này ngay; script không lưu mật khẩu dạng rõ.`);
}

main()
  .catch(error => {
    console.error('Không thể tạo tài khoản quản trị:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
