import Database from "better-sqlite3";

const sqlite = new Database(process.env.DATABASE_URL ?? "./sqlite.db");
sqlite.pragma("foreign_keys = OFF");

const tables = [
  "activity_logs",
  "wishes",
  "rsvps",
  "guests",
  "gifts",
  "galleries",
  "albums",
  "stories",
  "events",
  "invitations",
  "transactions",
  "sessions",
  "users",
];

for (const table of tables) {
  const info = sqlite.prepare(`DELETE FROM ${table}`).run();
  console.log(`- ${table}: ${info.changes} baris dihapus`);
}

sqlite.pragma("foreign_keys = ON");
console.log("Selesai. Data pengguna & konten dibersihkan (paket, template, pengaturan dipertahankan).");
console.log("Pengguna pertama yang mendaftar otomatis menjadi admin.");
sqlite.close();
