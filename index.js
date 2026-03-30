import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
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

    // Inisialisasi socket
    const sock = makeWASocket({
        logger,
        printQRInTerminal: false, // Matikan QR karena pakai pairing code
        auth: state,
        browser: Browsers.ubuntu('Chrome'), // Browser yang digunakan
        generateHighQualityLinkPreview: true,
    });

    // Proses Pairing Code jika belum login
    if (!sock.authState.creds.registered) {
        // Validasi Nomor
        let rawNumber = config.botNumber;
        
        if (!rawNumber) {
            console.log(`\n==================================================`);
            console.log(`❌ ERROR: NOMOR WHATSAPP (NUMBER) TIDAK DITEMUKAN!`);
            console.log(`==================================================`);
            console.log(`Silakan masukkan nomor WhatsApp di Environment Variables.`);
            console.log(`Contoh: NUMBER=628xxxx`);
            console.log(`==================================================\n`);
            process.exit(1);
        }

        // Format Nomor: Hapus simbol selain angka (e.g., +62 858 -> 62858)
        const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
        
        if (cleanNumber.length < 10) {
            console.log(`\n❌ ERROR: Nomor "${cleanNumber}" terlalu pendek atau tidak valid!`);
            process.exit(1);
        }

        console.log(`[ SYSTEM ] Input nomor: ${cleanNumber}`);

        // Delay 5 detik sebelum request pairing untuk menghindari error 405 (Connection Closed)
        // Memastikan socket sudah siap sebelum meminta kode
        setTimeout(async () => {
            try {
                console.log(`[ SYSTEM ] Meminta pairing code...`);
                const code = await sock.requestPairingCode(cleanNumber);
                const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                
                console.log(`\n==================================================`);
                console.log(`[ SUCCESS ] Kode pairing: ${formattedCode}`);
                console.log(`==================================================`);
                console.log(`1. Buka WhatsApp di HP Anda`);
                console.log(`2. Ketuk ikon titik tiga > Perangkat Tertaut`);
                console.log(`3. Ketuk 'Tautkan Perangkat'`);
                console.log(`4. Ketuk 'Tautkan dengan nomor telepon saja'`);
                console.log(`5. Masukkan kode pairing di atas\n`);
            } catch (error) {
                console.error(`\n❌ [ ERROR ] Gagal mendapatkan pairing code:`, error?.message || error);
                if (error?.message?.includes('405')) {
                    console.log(`[ SYSTEM ] Error 405 terdeteksi. Mencoba ulang dalam 10 detik...`);
                } else {
                    console.log(`[ SYSTEM ] Terjadi kesalahan. Mencoba ulang dalam 10 detik...`);
                }
                setTimeout(() => connectToWhatsApp(), 10000);
            }
        }, 5000);
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
                process.exit(0);
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
    sock.ev.on('messages.upsert', async (m) => {
        try {
            // Hanya proses pesan baru
            if (m.type !== 'notify') return;
            
            const msg = m.messages[0];
            if (!msg.message) return;
            if (msg.key.fromMe && config.mode !== 'self') return; // Jangan respon pesan sendiri kecuali mode self
            
            await handleMessages(sock, msg);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
}

// Jalankan bot
connectToWhatsApp();
