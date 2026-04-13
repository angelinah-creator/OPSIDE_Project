// npx tsx .\prisma\seed-admin.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@gmail.com';
  
  // Try to find the admin
  const admin = await prisma.user.findUnique({
    where: { email },
  });

  if (admin) {
    console.log('Admin user exists. Verifying password...');
    const isValid = await bcrypt.compare('Admin@123456', admin.password);
    console.log('Password valid for Admin@123456?', isValid);
    
    if (!isValid) {
      console.log('Updating password to valid hash...');
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('Password updated.');
    }
  } else {
    console.log('Admin user NOT FOUND. Creating it now...');
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'admin',
        first_name: 'Super',
        last_name: 'Admin',
        status: 'active'
      }
    });
    console.log('Admin user created successfully.');
  }

  const allAdmins = await prisma.user.findMany({ where: { role: 'admin' } });
  console.log('Current admins:', allAdmins);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
