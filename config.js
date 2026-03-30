export default {
    // Nomor WhatsApp bot untuk pairing code (wajib diisi di Environment Variables)
    // Diambil dari variabel "NUMBER" di panel Pterodactyl
    botNumber: process.env.NUMBER || "",

    // Nomor WhatsApp owner (diambil dari variabel "OWNER")
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
