import { generatePassword } from "@/utils/commonTools";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const { passwordHash, salt } = generatePassword("123456");
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      email: "admin@livstyle.cn",
      username: "admin",
      password: passwordHash,
      salt: salt, // TODO: generate salt
      phone: "12345678901",
    },
  });
  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
