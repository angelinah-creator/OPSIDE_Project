import { PrismaClient, Role, SkillCategory, Speciality, Currency } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash('Admin123!', 10),
        role: Role.admin,
        status: 'active',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // 2. Seed skills
  const skillsData: { name: string; category: SkillCategory }[] = [
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
  console.log(`✅ ${skillsData.length} skills seeded`);

  console.log('🌱 Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });