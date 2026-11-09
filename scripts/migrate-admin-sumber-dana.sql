-- Tambah kolom sumber dana untuk admin agar admin bisa dikunci ke satu
-- sumber dana (hanya melihat transaksi miliknya).
--
-- Idempoten: aman dijalankan berulang kali.
--
-- CATATAN: repo ini tidak punya folder prisma/migrations/, jadi `prisma migrate
-- deploy` selalu gagal dengan P3005 (pre-existing, tidak terkait). Schema
-- diterapkan lewat script ini.

ALTER TABLE "Admin"
  ADD COLUMN IF NOT EXISTS "sumberDanaId" integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Admin_sumberDanaId_fkey'
  ) THEN
    ALTER TABLE "Admin"
      ADD CONSTRAINT "Admin_sumberDanaId_fkey"
      FOREIGN KEY ("sumberDanaId") REFERENCES "SumberDana"(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Admin_sumberDanaId_idx" ON "Admin"("sumberDanaId");
