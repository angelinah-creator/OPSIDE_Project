// npx tsx .\\prisma\\seed-admin.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

function validateAdminPassword(password: string): void {
  const strong = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}/;
  if (!strong.test(password)) {
    throw new Error(
      'ADMIN_SEED_PASSWORD must be at least 12 chars with uppercase, lowercase and number.',
    );
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing required env var: DATABASE_URL');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@gmail.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';
  validateAdminPassword(password);

  const admin = await prisma.user.findUnique({ where: { email } });

  if (admin) {
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid || admin.status !== 'active') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, status: 'active' },
      });
      console.log(`Admin user updated: ${email}`);
    } else {
      console.log(`Admin user already up-to-date: ${email}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'admin',
      first_name: process.env.ADMIN_SEED_FIRST_NAME || 'Super',
      last_name: process.env.ADMIN_SEED_LAST_NAME || 'Admin',
      status: 'active',
    },
  });
  console.log(`Admin user created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
