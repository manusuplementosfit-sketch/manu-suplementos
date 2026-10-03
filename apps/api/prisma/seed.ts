import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? '').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env');

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, name: process.env.ADMIN_NAME ?? 'Vendedor', passwordHash: await hash(password, 10) },
  });

  for (const name of ['Whey Protein', 'Creatina', 'Pré-treino', 'Vitaminas', 'Acessórios']) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  console.log(`Seed concluído. Login do vendedor: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
