import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const problems = JSON.parse(
  readFileSync(path.join(__dirname, "seed-data.json"), "utf-8"),
);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding ${problems.length} problems...`);

  for (const p of problems) {
    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        order: p.order,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        leetcodeUrl: p.leetcodeUrl,
      },
      create: { ...p },
    });
  }

  const count = await prisma.problem.count();
  console.log(`Done. ${count} problems in the database.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
