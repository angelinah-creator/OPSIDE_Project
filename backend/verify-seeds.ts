import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Verification Summary ---');
  
  // 1. Check Admin User
  const adminCount = await prisma.user.count({
    where: { role: 'admin' }
  });
  console.log(`Admin Users found: ${adminCount}`);
  
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { email: true, status: true }
  });
  admins.forEach(a => console.log(` - Admin Email: ${a.email} (Status: ${a.status})`));

  // 2. Check Skills
  const skillsCount = await prisma.skill.count();
  console.log(`Total Skills found: ${skillsCount}`);
  
  const categories = await prisma.skill.groupBy({
    by: ['category'],
    _count: {
      _all: true
    }
  });
  console.log('Skills by Category:');
  categories.forEach(c => {
    console.log(` - ${c.category}: ${c._count._all}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
