import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type CountRow = { total: bigint; commented: bigint };
type MissingRow = { objectType: string; objectName: string };

async function main() {
  const [tableCounts] = await prisma.$queryRaw<CountRow[]>`
    SELECT
      count(*)::bigint AS total,
      count(obj_description(c.oid, 'pg_class'))::bigint AS commented
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
  `;

  const [columnCounts] = await prisma.$queryRaw<CountRow[]>`
    SELECT
      count(*)::bigint AS total,
      count(col_description(c.oid, a.attnum))::bigint AS commented
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
      AND a.attnum > 0
      AND NOT a.attisdropped
  `;

  const missing = await prisma.$queryRaw<MissingRow[]>`
    SELECT 'TABLE' AS "objectType", c.relname AS "objectName"
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
      AND obj_description(c.oid, 'pg_class') IS NULL
    UNION ALL
    SELECT 'COLUMN', c.relname || '.' || a.attname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND col_description(c.oid, a.attnum) IS NULL
    ORDER BY 1, 2
  `;

  console.log({
    tables: `${tableCounts.commented}/${tableCounts.total}`,
    columns: `${columnCounts.commented}/${columnCounts.total}`,
    missing,
  });

  if (missing.length > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
