// npx tsx .\prisma\seed-skills.ts

import { PrismaClient, SkillCategory } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

async function main() {
  console.log('Seeding skills into database...');
  for (const skill of skillsData) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
    console.log(`- Upserted skill: ${skill.name}`);
  }
  console.log('All skills seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
