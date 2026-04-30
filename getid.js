const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.item.findFirst().then(item => console.log(item.id)).finally(() => prisma.$disconnect());
