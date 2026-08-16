import { readFile, readdir } from "node:fs/promises";

const root = new URL("../supabase/migrations/", import.meta.url);
const files = (await readdir(root)).filter((name) => /^\d{14}_.+\.sql$/.test(name)).sort();
const destructive = /\b(drop\s+(?:table|column|constraint|index)|alter\s+column\s+\w+\s+type|rename\s+(?:column|table))\b/i;
const approval = /--\s*taskflow:contract-approved\s+owner=[^\s]+\s+rollback=[^\s]+/i;
const violations = [];

for (const file of files) {
  const source = await readFile(new URL(file, root), "utf8");
  if (destructive.test(source) && !approval.test(source)) violations.push(file);
}

if (violations.length) {
  throw new Error(`Destructive migration requires an explicit contract approval marker with owner and rollback: ${violations.join(", ")}`);
}
console.log(`Migration safety passed for ${files.length} migration(s).`);
