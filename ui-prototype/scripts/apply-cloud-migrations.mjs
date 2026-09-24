import { readFile, readdir } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.SUPABASE_DB_URL || process.argv[2];
if (!databaseUrl) {
  console.error("Please provide SUPABASE_DB_URL");
  process.exit(1);
}

console.log("Connecting to Supabase Database...");
const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
  connect_timeout: 30,
});

try {
  const files = (await readdir(new URL("../supabase/migrations/", import.meta.url)))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} migration files to apply.`);

  for (const file of files) {
    console.log(`Applying migration: ${file}...`);
    const content = await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8");
    try {
      await sql.unsafe(content);
      console.log(`✓ Applied ${file}`);
    } catch (err) {
      if (err.code === '42710' || err.code === '42P07' || err.code === '42P06' || err.message.includes('already exists')) {
        console.log(`⚠ Skipped existing objects in ${file}`);
      } else {
        throw err;
      }
    }
  }

  console.log("SUCCESS: All migrations processed successfully!");
} catch (err) {
  console.error("Migration error:", err.message);
  process.exit(1);
} finally {
  await sql.end({ timeout: 2 });
}
