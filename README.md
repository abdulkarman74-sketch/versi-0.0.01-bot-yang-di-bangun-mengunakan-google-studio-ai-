# Base WhatsApp Bot - Pairing Code

Base script bot WhatsApp ringan dan clean menggunakan Node.js dan library Baileys (`@whiskeysockets/baileys`) versi terbaru. Bot ini menggunakan metode **Pairing Code** (bukan scan QR), sehingga lebih mudah dihubungkan.

## 🌟 Fitur Utama
- ✅ Support Node.js v20+
- ✅ Menggunakan ES Module (`type: "module"`)
- ✅ Login menggunakan Pairing Code (Tanpa QR)
- ✅ Auto Reconnect (Anti DC)
- ✅ Multi-file Auth State (Aman dari banned)
- ✅ Menu Owner (Ping, Self Mode, Public Mode)
- ✅ Clean Console & Code

## ⚙️ Persyaratan
- Node.js versi 20 atau lebih baru
- npm (Node Package Manager)

## 🚀 Cara Install & Menjalankan

1. Buka terminal/command prompt di folder project.
2. Install dependensi:
   \`\`\`bash
   npm install
   \`\`\`
3. Edit file \`config.js\` dan sesuaikan dengan nomor WhatsApp owner Anda (gunakan kode negara, contoh: \`6281234567890\`).
4. Jalankan bot:
   \`\`\`bash
   npm start
   \`\`\`

## 🔗 Cara Pairing (Menghubungkan ke WhatsApp)

1. Saat pertama kali dijalankan, bot akan meminta Anda memasukkan nomor WhatsApp di terminal.
2. Masukkan nomor WhatsApp Anda dengan kode negara (contoh: \`6281234567890\`).
3. Bot akan menampilkan **Kode Pairing** (8 karakter, contoh: \`ABCD-1234\`).
4. Buka aplikasi WhatsApp di HP Anda.
5. Buka menu **Perangkat Tertaut** (Linked Devices) > **Tautkan Perangkat**.
6. Pilih **Tautkan dengan nomor telepon saja** (Link with phone number instead) di bagian bawah layar scan QR.
7. Masukkan kode pairing yang muncul di terminal.
8. Selesai! Bot akan terhubung dan siap digunakan.

## 📜 Daftar Command

Gunakan prefix yang diatur di \`config.js\` (default: \`.\`)

- \`.menu\` - Menampilkan menu bot
- \`.ping\` - Cek status bot
- \`.self\` - Mengubah bot ke mode self (Hanya merespon owner)
- \`.public\` - Mengubah bot ke mode public (Merespon semua orang)

## 📁 Struktur File
- \`index.js\`: Main file untuk koneksi bot.
- \`config.js\`: Pengaturan bot (owner, prefix, dll).
- \`handler.js\`: Menangani pesan masuk dan command.
- \`menu.js\`: Teks menu bot.
- \`pairing.js\`: Fungsi untuk input nomor telepon di terminal.
- \`session/\`: Folder otomatis yang menyimpan sesi login.

---
_Dibuat dengan ❤️ menggunakan Baileys_
