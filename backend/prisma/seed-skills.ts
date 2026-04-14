// npx tsx .\prisma\seed-skills.ts

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const skillsData = [  
  // Frontend
  { name: 'React', category: 'frontend' },
  { name: 'Vue.js', category: 'frontend' },
  { name: 'Angular', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'HTML/CSS', category: 'frontend' },
  { name: 'Tailwind', category: 'frontend' },
  // Backend
  { name: 'Node.js', category: 'backend' },
  { name: 'NestJS', category: 'backend' },
  { name: 'Python', category: 'backend' },
  { name: 'Django', category: 'backend' },
  { name: 'FastAPI', category: 'backend' },
  { name: 'PHP', category: 'backend' },
  { name: 'Laravel', category: 'backend' },
  { name: 'Java', category: 'backend' },
  { name: 'Spring Boot', category: 'backend' },
  // Mobile
  { name: 'React Native', category: 'mobile' },
  { name: 'Flutter', category: 'mobile' },
  { name: 'Swift', category: 'mobile' },
  { name: 'Kotlin', category: 'mobile' },
  // DevOps
  { name: 'Docker', category: 'devops' },
  { name: 'Kubernetes', category: 'devops' },
  { name: 'AWS', category: 'devops' },
  { name: 'CI/CD', category: 'devops' },
  { name: 'Terraform', category: 'devops' },
  // Data
  { name: 'PostgreSQL', category: 'data' },
  { name: 'MongoDB', category: 'data' },
  { name: 'Redis', category: 'data' },
  { name: 'Elasticsearch', category: 'data' },
  { name: 'Python Data', category: 'data' },
  { name: 'SQL', category: 'data' },
  // Design
  { name: 'Figma', category: 'design' },
  { name: 'Photoshop', category: 'design' },
  { name: 'AdobeXD', category: 'design' },
  { name: 'Photopea', category: 'design' },
];

async function main() {
  console.log('Seeding skills into database...');
  for (const skill of skillsData) {
    const existing = await prisma.skill.findFirst({
      where: {
        name: skill.name,
        owner_id: null,
      },
    });

    if (existing) {
      await prisma.skill.update({
        where: { id: existing.id },
        data: { category: skill.category },
      });
      console.log(`- Updated skill: ${skill.name}`);
    } else {
      await prisma.skill.create({
        data: {
          ...skill,
          owner_id: null,
          is_custom: false,
        },
      });
      console.log(`- Created skill: ${skill.name}`);
    }
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
