# PROMPT — Redesign Sistem Template Undangan (mirip gaya galeriundanganofficial.com)

Tempel prompt di bawah ini ke coding agent (OpenCode/TUI) yang sedang membuka repo
`undangan-digital` (Next.js 16 + React 19 + Drizzle/SQLite + Tailwind).

---

Kamu bekerja di repo aplikasi SaaS undangan digital (Next.js 16, React 19, Drizzle ORM
SQLite, Tailwind). Tugasmu: **mendesain ulang total sistem template undangan publik**
supaya tampilannya setara situs referensi **galeriundanganofficial.com** — katalog tema
adat Indonesia yang tiap temanya punya artwork/ornamen khas, palet warna kuat, dan cover
portrait yang terlihat "mahal", bukan sekadar ganti warna.

## Kondisi saat ini (sudah diverifikasi dari source — jangan bantah, perbaiki)

1. `src/lib/template-config.ts` mendefinisikan `TemplateConfig`: `layout` (classic,
   modern, minimal, floral, royal, javanese), `coverStyle` (full, split, framed),
   `frameStyle` (rounded, square, arch), `fontDisplay`, `fontBody`, `colors`
   (primary/accent/background/surface/text), `motif` (string), `sections`.
2. **Masalah utama:** render publik di `src/app/u/[slug]/page.tsx` +
   `src/components/invitation/invitation-screen.tsx` praktis TIDAK memakai
   `config.layout`, `coverStyle`, dan `frameStyle`. Semua template dirender dengan
   skeleton yang sama; bedanya hanya warna + font. `motif` hanya string teks dan
   tidak pernah digambar.
3. Seed (`src/db/seed.ts`) hanya punya 3 template: Elegant Rose, Royal Emerald,
   Midnight Slate.
4. Font sudah dimuat dinamis dari Google Fonts berdasarkan `config.fontDisplay` /
   `config.fontBody` di `page.tsx` — pertahankan mekanisme ini.

## Aturan main

- JANGAN mengunduh, menyalin, atau memakai gambar dari galeriundanganofficial.com
  (itu aset berhak cipta). Semua ornamen WAJIB karya original yang kamu buat sendiri
  sebagai **komponen SVG React** (inline SVG, tanpa file gambar eksternal),
  terinspirasi gaya visualnya saja: ornamen adat, border simetris, siluet arsitektur
  tradisional, pola geometris batik/songket/ulos.
- Jangan ubah skema database. Template tetap disimpan sebagai JSON `config` di tabel
  `templates` (kolom yang ada sudah cukup). Seed harus idempotent (tidak duplikat
  saat dijalankan ulang — ikuti pola seed yang sudah ada).
- Jangan rusak fitur yang sudah jalan: cover + animasi buka undangan, musik,
  countdown, quote, couple, events, story, gallery/album, gift, RSVP, wishes,
  section-nav, watermark, custom HTML/CSS template (`src/lib/custom-template.ts`).
- Mobile-first: halaman undangan dirender dalam kolom sempit (maks ±480px, tengah
  layar) seperti situs undangan pada umumnya.
- Setelah selesai: `npm run build` dan `npm run lint` HARUS lolos tanpa error.

## Tugas 1 — Sistem ornamen SVG per motif

Buat `src/components/invitation/ornaments.tsx` berisi komponen SVG original yang
dipilih berdasarkan field `motif` pada config. Minimal komponen ini:

- `OrnamentCorner` — ornamen sudut frame (4 sudut, bisa di-mirror).
- `OrnamentDivider` — pembatas antar-section (garis + motif tengah).
- `CoverArch` — bingkai lengkung (arch) untuk foto/nama mempelai di cover.
- Motif khas per tema (dipakai sebagai pola border/background tipis & divider):
  - `kawung` (lingkaran berpotongan khas batik Jawa)
  - `mega-mendung` (gelombang awan berlapis, khas Cirebon — untuk Jawa Biru)
  - `parang` (diagonal berulang khas batik Jawa — untuk Jawa Merah/Hitam)
  - `siluet-joglo` (siluet atap rumah joglo untuk cover tema Jawa)
  - `candi-bentar` + `frangipani` (gerbang terbelah & bunga kamboja — Bali)
  - `songket` (pola geometris zigzag/diamond songket — Palembang & Melayu)
  - `ulos` (pola geometris garis tegas merah-hitam-putih — Batak & Mandailing)
  - `marawa` (segitiga merah-kuning-hitam — Minang)
  - `tongkonan` (siluet atap perahu rumah Toraja)
  - `tapis` (pola geometris Lampung)
  - `pintu-aceh` (motif pintu khas Aceh)
  - `peony-lampion` (bunga peony + lampion — Chinese)
  - `daun-emas` (daun generik untuk royal/floral — dipakai tema lama)

Semua ornamen memakai `currentColor`/prop warna dari config (`primary`/`accent`)
supaya otomatis mengikuti palet tema. Tambahkan field opsional `ornament` (string
key motif) ke `TemplateConfig` + `normalizeTemplateConfig` di
`src/lib/template-config.ts`, dengan fallback dari field `motif` lama.

## Tugas 2 — Layout benar-benar berbeda

Di `src/app/u/[slug]/page.tsx` dan `invitation-screen.tsx`, buat `config.layout`,
`coverStyle`, dan `frameStyle` benar-benar memengaruhi render:

- **classic**: cover full + arch emas, divider ornamen di tiap section, heading
  serif tengah, frame foto rounded.
- **modern**: cover split (foto separuh + panel warna solid), sudut tegas,
  heading sans bold rata kiri, tanpa ornamen sudut.
- **minimal**: tanpa ornamen kecuali divider garis tipis, whitespace besar,
  tipografi kecil uppercase tracking lebar.
- **floral**: ornamen sudut bunga/daun, frame foto arch, aksen kelopak jatuh
  (efek petals yang sudah ada dipakai penuh).
- **royal**: border ganda emas di sekeliling halaman, monogram besar di cover,
  divider mewah, frame foto arch + ring emas.
- **javanese**: pola kawung/mega mendung sebagai background tipis, siluet joglo
  di cover, divider parang, palet adat kuat.

`coverStyle`: `full` = foto penuh + overlay; `split` = foto/panel berdampingan;
`framed` = foto dalam frame ornamen di atas background pola.
`frameStyle`: `rounded`/`square`/`arch` memengaruhi bentuk frame foto mempelai
dan galeri.

## Tugas 3 — Seed tema adat baru (tambah, jangan hapus 3 tema lama)

Tambahkan template berikut ke `src/db/seed.ts` (category `pernikahan`, sebagian
`isPremium: true`). Palet & font adalah titik awal — poles sampai terlihat mahal:

| code | nama | layout | primary | accent | background | fontDisplay | motif |
|---|---|---|---|---|---|---|---|
| jawa-biru | Jawa Biru Modern | javanese | #16295e | #c9a24b | #eef2fb | Cinzel | mega-mendung |
| jawa-merah | Jawa Merah Klasik | javanese | #7f1d1d | #d4af37 | #fdf3ec | Cinzel | parang |
| jawa-hitam | Jawa Hitam Elegan | javanese | #17130c | #c9a24b | #f5efe2 | Cinzel | parang |
| art-jawa | Art Jawa Coklat | classic | #4a2f1b | #b98a44 | #f7efe3 | Fraunces | kawung |
| bali | Art Bali | floral | #7c2d12 | #e0a526 | #fdf6ea | Cormorant Garamond | candi-bentar |
| palembang | Art Palembang Songket | royal | #6d0f1b | #d4af37 | #fbf1e8 | Cinzel | songket |
| banjar | Art Banjar | classic | #065f46 | #f59e0b | #eefaf3 | Fraunces | songket |
| batak | Art Batak Ulos | classic | #991b1b | #171717 | #fdf6ec | Fraunces | ulos |
| batak-karo | Batak Karo | classic | #b91c1c | #facc15 | #fdf6ec | Fraunces | ulos |
| mandailing | Art Mandailing | classic | #78350f | #d4af37 | #f9f1e3 | Fraunces | ulos |
| chinese | Art Chinese | royal | #b91c1c | #f5c542 | #fff7e6 | Cinzel | peony-lampion |
| minang | Art Minang Marawa | royal | #7f1d1d | #eab308 | #fdf8ec | Cinzel | marawa |
| toraja | Art Toraja | classic | #451a03 | #dc2626 | #f8efe2 | Fraunces | tongkonan |
| melayu | Art Melayu | royal | #166534 | #facc15 | #f2f9ee | Cinzel | songket |
| lampung | Art Lampung Tapis | classic | #7c2d12 | #d4af37 | #faf1e6 | Fraunces | tapis |
| sunda | Art Sunda Maroon | floral | #881337 | #c9a24b | #fdf2f4 | Cormorant Garamond | kawung |
| bugis | Art Bugis | royal | #991b1b | #d4af37 | #fbf3e4 | Cinzel | songket |
| aceh | Art Aceh | classic | #14532d | #d4af37 | #f0f7ee | Fraunces | pintu-aceh |

`fontBody` untuk semua tema baru: `Plus Jakarta Sans`. Isi `description` Bahasa
Indonesia yang menjual (1 kalimat). `sortOrder` lanjutkan dari tema lama.

## Tugas 4 — Preview dashboard = render asli

`src/components/dashboard/template-preview.tsx` harus memakai komponen ornamen
dan aturan layout/frame yang sama dengan render publik, supaya yang dilihat admin/
user di preview sama dengan hasil akhir. Jangan biarkan preview jadi versi
sederhana yang berbeda.

## Urutan kerja & kriteria terima

1. Kerjakan **Jawa Biru Modern** dulu secara penuh (cover, ornamen mega mendung,
   divider, frame) sebagai referensi implementasi. Pastikan 1 undangan contoh
   dengan tema ini terlihat setara kualitas cover katalog referensi: ada artwork
   khas, bukan cuma ganti warna.
2. Generalisasikan ke semua layout & tema lain.
3. Selesai bila:
   - `npm run build` + `npm run lint` lolos.
   - Beralih antar-template menghasilkan perbedaan visual yang jelas (struktur
     cover, ornamen, frame), bukan hanya warna/font.
   - Semua section lama tetap tampil & berfungsi (RSVP, wishes, galeri, musik,
     countdown) di semua tema.
   - Seed bisa dijalankan ulang tanpa duplikat; tema lama tidak hilang.
4. Laporkan ringkas: file yang diubah, daftar tema baru, dan cara mencobanya
   (perintah seed + contoh URL undangan).
