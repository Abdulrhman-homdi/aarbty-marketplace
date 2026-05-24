import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const DEMO_USERS = [
  { name: "أحمد العمري", email: "provider@arabati.sa", password: "123456", role: "provider", phone: "0501234567" },
  { name: "سارة الزهراني", email: "customer@arabati.sa", password: "123456", role: "customer", phone: "0559876543" },
  { name: "مدير المنصة", email: "admin@arabati.sa", password: "admin123", role: "admin", phone: null },
] as const;

async function seedUsers() {
  console.log("🌱 بدء إضافة المستخدمين التجريبيين...");

  for (const user of DEMO_USERS) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1);
    if (existing.length > 0) {
      console.log(`⏭️  ${user.email} موجود مسبقاً — تم التخطي`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);
    await db.insert(usersTable).values({
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      phone: user.phone ?? null,
    });
    console.log(`✅ تم إضافة: ${user.name} (${user.email}) — دور: ${user.role}`);
  }

  console.log("\n📋 بيانات الدخول التجريبية:");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(10)} ${u.email}  /  ${u.password}`);
  }

  process.exit(0);
}

seedUsers().catch(err => {
  console.error("❌ خطأ:", err);
  process.exit(1);
});
