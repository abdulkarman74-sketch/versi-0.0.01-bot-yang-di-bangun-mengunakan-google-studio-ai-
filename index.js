import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from './config.js';
import { handleMessages } from './handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup logger (silent agar terminal clean)
const logger = pino({ level: 'silent' });

// Global Error Handlers untuk mencegah crash di Pterodactyl
process.on('uncaughtException', (err) => {
    console.error('Caught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function connectToWhatsApp() {
    console.log('[ SYSTEM ] Memulai koneksi ke WhatsApp...');
    
    const sessionPath = path.join(__dirname, 'session');
    
    // Setup auth state (multi-file)
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[ SYSTEM ] Menggunakan WA v${version.join('.')} (isLatest: ${isLatest})`);

    // Validasi Nomor jika belum ada sesi
    let cleanNumber = '';
    if (!state.creds.registered) {
        let rawNumber = config.botNumber;
        
        if (!rawNumber) {
            console.log(`\n==================================================`);
            console.log(`⚠️ WARNING: NOMOR WHATSAPP (NUMBER) TIDAK DITEMUKAN!`);
            console.log(`==================================================`);
            console.log(`Isi nomor di panel → Startup → Environment Variables`);
            console.log(`Contoh: NUMBER=628xxxx`);
            console.log(`==================================================\n`);
            // Biarkan proses tetap hidup agar panel tidak loop restart
            setInterval(() => {}, 1000 * 60 * 60);
            return;
        }

        // Format Nomor: Hapus simbol selain angka (e.g., +62 858 -> 62858)
        cleanNumber = rawNumber.replace(/[^0-9]/g, '');
        
        if (cleanNumber.length < 10) {
            console.log(`\n⚠️ WARNING: Nomor "${cleanNumber}" terlalu pendek atau tidak valid!`);
            console.log(`Isi nomor di panel → Startup → Environment Variables dengan benar.`);
            setInterval(() => {}, 1000 * 60 * 60);
            return;
        }
    }

    // Inisialisasi socket
    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false, // Matikan QR karena pakai pairing code
        auth: state,
        browser: Browsers.ubuntu('Chrome'), // Browser yang digunakan
        generateHighQualityLinkPreview: true,
    });

    // Proses Pairing Code jika belum login
    if (!sock.authState.creds.registered) {
        console.log(`[ INFO ] Menggunakan nomor: ${cleanNumber}`);

        // Delay 3 detik sebelum request pairing untuk memastikan socket siap
        setTimeout(async () => {
            try {
                console.log(`[ INFO ] Meminta pairing code...`);
                const code = await sock.requestPairingCode(cleanNumber);
                const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                
                console.log(`\n==================================================`);
                console.log(`[ SUCCESS ] Pairing code: ${formattedCode}`);
                console.log(`==================================================`);
                console.log(`1. Buka WhatsApp di HP Anda`);
                console.log(`2. Ketuk ikon titik tiga > Perangkat Tertaut`);
                console.log(`3. Ketuk 'Tautkan Perangkat'`);
                console.log(`4. Ketuk 'Tautkan dengan nomor telepon saja'`);
                console.log(`5. Masukkan kode pairing di atas\n`);
            } catch (error) {
                console.error(`\n❌ [ ERROR ] Gagal mendapatkan pairing code:`, error?.message || error);
                console.log(`[ SYSTEM ] Koneksi akan dicoba ulang secara otomatis...`);
            }
        }, 3000);
    } else {
        console.log(`[ SYSTEM ] Sesi ditemukan, melewati proses pairing...`);
        console.log(`[ SYSTEM ] Menghubungkan ke WhatsApp...`);
    }

    // Event listener untuk koneksi
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            
            console.log(`\n❌ [ SYSTEM ] Koneksi terputus (Alasan: ${reason}).`);
            
            if (shouldReconnect) {
                console.log('[ SYSTEM ] Mencoba menghubungkan kembali dalam 5 detik...');
                setTimeout(connectToWhatsApp, 5000); // Delay aman sebelum reconnect
            } else {
                console.log('⚠️ [ SYSTEM ] Sesi telah logout. Silakan hapus folder "session" dan jalankan ulang.');
                // Hapus folder session jika logout agar bisa pairing ulang
                if (fs.existsSync(sessionPath)) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    console.log('🗑️ [ SYSTEM ] Folder session telah dihapus. Silakan restart bot.');
                }
                // Biarkan proses hidup agar tidak loop restart
                setInterval(() => {}, 1000 * 60 * 60);
            }
        } else if (connection === 'open') {
            console.log(`\n✅ [ SUCCESS ] BOT BERHASIL TERSAMBUNG KE WHATSAPP!`);
            console.log(`==================================================`);
            console.log(`🤖 Nama Bot : ${config.botName}`);
            console.log(`👑 Owner    : ${config.ownerNumber}`);
            console.log(`⚙️ Mode     : ${config.mode.toUpperCase()}`);
            console.log(`📌 Prefix   : [ ${config.prefix} ]`);
            console.log(`==================================================\n`);
        }
    });

    // Simpan kredensial saat ada update
    sock.ev.on('creds.update', saveCreds);

    // Event listener untuk pesan masuk
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.message) return;
            if (m.key && m.key.remoteJid === 'status@broadcast') return;
            
            // Tambahkan log untuk memastikan bot menerima pesan
            console.log(m);
            
            // Jangan respon pesan sendiri kecuali mode self
            if (m.key.fromMe && config.mode !== 'self') return;
            
            const msg = m.message;
            const text = msg.conversation || 
                         msg.extendedTextMessage?.text || 
                         msg.imageMessage?.caption || 
                         msg.videoMessage?.caption || 
                         "";
                         
            if (!text) return;
            
            console.log("Pesan masuk:", text);
            
            await handleMessages(sock, m, text);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
}

// Jalankan bot
connectToWhatsApp();
