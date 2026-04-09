import { PrismaClient, Role, UserStatus, SkillCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // ─── Admin User
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: Role.admin,
        first_name: 'Super',
        last_name: 'Admin',
        status: UserStatus.active,
      },
    });
    console.log('Admin user created: admin@gmail.com / Admin@123456');
  } else {
    console.log('Admin already exists, skipping.');
  }

  // ─── Skills
  const skillsData = [
    // Frontend
    { name: 'React', category: SkillCategory.frontend },
    { name: 'Vue.js', category: SkillCategory.frontend },
    { name: 'Angular', category: SkillCategory.frontend },
    { name: 'Next.js', category: SkillCategory.frontend },
    { name: 'TypeScript', category: SkillCategory.frontend },
    { name: 'HTML/CSS', category: SkillCategory.frontend },
    { name: 'Tailwind', category: SkillCategory.frontend },
    // Backend
    { name: 'Node.js', category: SkillCategory.backend },
    { name: 'NestJS', category: SkillCategory.backend },
    { name: 'Python', category: SkillCategory.backend },
    { name: 'Django', category: SkillCategory.backend },
    { name: 'FastAPI', category: SkillCategory.backend },
    { name: 'PHP', category: SkillCategory.backend },
    { name: 'Laravel', category: SkillCategory.backend },
    { name: 'Java', category: SkillCategory.backend },
    { name: 'Spring Boot', category: SkillCategory.backend },
    // Mobile
    { name: 'React Native', category: SkillCategory.mobile },
    { name: 'Flutter', category: SkillCategory.mobile },
    { name: 'Swift', category: SkillCategory.mobile },
    { name: 'Kotlin', category: SkillCategory.mobile },
    // DevOps
    { name: 'Docker', category: SkillCategory.devops },
    { name: 'Kubernetes', category: SkillCategory.devops },
    { name: 'AWS', category: SkillCategory.devops },
    { name: 'CI/CD', category: SkillCategory.devops },
    { name: 'Terraform', category: SkillCategory.devops },
    // Data
    { name: 'PostgreSQL', category: SkillCategory.data },
    { name: 'MongoDB', category: SkillCategory.data },
    { name: 'Redis', category: SkillCategory.data },
    { name: 'Elasticsearch', category: SkillCategory.data },
    { name: 'Python Data', category: SkillCategory.data },
    { name: 'SQL', category: SkillCategory.data },
    // Design
    { name: 'Figma', category: SkillCategory.design },
    { name: 'Photoshop', category: SkillCategory.design },
    { name: 'AdobeXD', category: SkillCategory.design },
    { name: 'Photopea', category: SkillCategory.design },
  ];

  for (const skill of skillsData) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  console.log(`${skillsData.length} skills seeded.`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
