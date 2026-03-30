export default {
    // Nomor WhatsApp bot untuk pairing code (wajib diisi jika belum ada session)
    // Awali dengan kode negara, contoh: "6281234567890"
    botNumber: process.env.NUMBER || "6285814369350",

    // Ganti dengan nomor WhatsApp owner (awali dengan kode negara, contoh: 6281234567890)
    ownerNumber: process.env.OWNER || "6285814369350",
    
    // Nama bot Anda
    botName: process.env.BOT_NAME || "Keyren",
    
    // Nama owner
    ownerName: process.env.OWNER_NAME || "Owner",
    
    // Prefix untuk command (contoh: .menu, !ping)
    prefix: process.env.PREFIX || ".",
    
    // Mode awal bot ('public' atau 'self')
    mode: process.env.MODE || "public"
};
