# Keyren WhatsApp Bot - Pairing Code

Bot WhatsApp ringan dan stabil menggunakan library Baileys (`@whiskeysockets/baileys`) versi terbaru, dioptimalkan khusus untuk panel Pterodactyl.

## 🌟 Fitur Utama
- ✅ Nama Bot: **Keyren**
- ✅ Owner: **6285814369350**
- ✅ Support Node.js v20+
- ✅ Login menggunakan Pairing Code (Tanpa QR)
- ✅ Auto Reconnect (Anti DC) dengan delay aman
- ✅ Multi-file Auth State (Aman dari banned)
- ✅ Menu Owner (Ping, Self Mode, Public Mode)
- ✅ **Pterodactyl Ready** (Tanpa input interaktif)
- ✅ Global Error Handler (Anti Crash)

## ⚙️ Persyaratan
- Node.js versi 20 atau lebih baru
- npm (Node Package Manager)

## 🚀 Cara Install & Menjalankan (Lokal)

1. Buka terminal/command prompt di folder project.
2. Install dependensi:
   \`\`\`bash
   npm install
   \`\`\`
3. Edit file \`config.js\` dan sesuaikan dengan nomor WhatsApp owner dan bot Anda (gunakan kode negara, contoh: \`6285814369350\`).
4. Jalankan bot:
   \`\`\`bash
   npm start
   \`\`\`

## ☁️ Cara Deploy di Pterodactyl Panel

1. Upload semua file ke dalam File Manager Pterodactyl.
2. Buka menu **Startup** di panel Pterodactyl.
3. Pastikan **Startup Command** diatur ke:
   \`\`\`bash
   npm start
   \`\`\`
4. Tambahkan **Environment Variables** (Variables) di panel Pterodactyl (opsional):
   - \`NUMBER\`: Nomor WhatsApp bot (contoh: 6285814369350)
   - \`OWNER\`: Nomor WhatsApp owner (contoh: 6285814369350)
   - \`BOT_NAME\`: Keyren
   - \`PREFIX\`: .
5. Buka menu **Console** dan klik **Start**.
6. Lihat console, bot akan menampilkan **Kode Pairing**.

## 🔗 Cara Pairing (Menghubungkan ke WhatsApp)

1. Pastikan nomor bot sudah diatur di \`config.js\` atau Environment Variables.
2. Saat dijalankan, bot akan menampilkan **Kode Pairing** (8 karakter) di console.
3. Buka aplikasi WhatsApp di HP yang akan dijadikan bot.
4. Buka menu **Perangkat Tertaut** > **Tautkan Perangkat** > **Tautkan dengan nomor telepon saja**.
5. Masukkan kode pairing yang muncul di console.
6. Selesai! Bot akan terhubung dan siap digunakan.

## 📜 Daftar Command

Gunakan prefix yang diatur di \`config.js\` (default: \`.\`)

- \`.menu\` - Menampilkan menu bot
- \`.ping\` - Cek status bot
- \`.self\` - Mengubah bot ke mode self (Hanya merespon owner)
- \`.public\` - Mengubah bot ke mode public (Merespon semua orang)

---
_Dibuat dengan ❤️ menggunakan Baileys_
