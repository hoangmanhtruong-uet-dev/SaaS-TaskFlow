import postgres from "postgres";

const regions = [
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-south-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "sa-east-1",
  "ca-central-1"
];

const ref = "ufdqvggtluwnpzxksein";
const pass = "Hoangtruong207%40";

for (const region of regions) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const dbUrl = `postgresql://postgres.${ref}:${pass}@${host}:6543/postgres`;
  const sql = postgres(dbUrl, { max: 1, ssl: "require", connect_timeout: 3 });
  try {
    const res = await sql`SELECT 1 as connected`;
    if (res[0]?.connected === 1) {
      console.log(`FOUND WORKING REGION: ${region} -> ${dbUrl}`);
      await sql.end();
      process.exit(0);
    }
  } catch (err) {
    if (!err.message.includes("tenant/user")) {
      console.log(`Region ${region} error: ${err.message}`);
    }
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }
}
console.log("No pooler region matched directly with postgres.<ref> username format.");
