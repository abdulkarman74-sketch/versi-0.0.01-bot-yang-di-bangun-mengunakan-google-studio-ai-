const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const NodeCache = require('node-cache');

// Setup logger (silent agar tidak spam di console panel)
const logger = pino({ level: 'silent' });
const msgRetryCounterCache = new NodeCache();

async function startBot() {
    // 5. SESSION STORAGE
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04'], // Penting untuk pairing code
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
    });

    // 10. AUTO RECONNECT
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[ SYSTEM ] Koneksi terputus. Reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            } else {
                console.log('[ SYSTEM ] Logged out. Silakan hapus folder session dan mulai ulang.');
            }
        } else if (connection === 'open') {
            console.log('[ SUCCESS ] Bot berhasil terhubung ke WhatsApp!');
        }
    });

    // Simpan session otomatis
    sock.ev.on('creds.update', saveCreds);

    // 8. AUTO SKIP JIKA SUDAH LOGIN
    if (!sock.authState.creds.registered) {
        // 9. LOGGING
        console.log('[ SYSTEM ] Menunggu input nomor di console...');
        console.log('Ketik nomor dengan format 62xxx');

        // 1 & 6. INPUT NOMOR VIA CONSOLE (PTERODACTYL) - Tanpa readline
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        const inputHandler = async (data) => {
            let phoneNumber = data.toString().trim();
            
            // 3. VALIDASI NOMOR - Hapus simbol, spasi, dll
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

            // Format wajib 62xxx
            if (!phoneNumber.startsWith('62') || phoneNumber.length < 10) {
                console.log('❌ Format nomor salah');
                console.log('Ketik nomor dengan format 62xxx');
                return;
            }

            // 2. AUTO DETECT NOMOR
            console.log(`[ INPUT ] Nomor diterima: ${phoneNumber}`);
            
            // Hapus listener agar tidak double input / crash di panel
            process.stdin.removeListener('data', inputHandler);
            process.stdin.pause();

            console.log('[ SYSTEM ] Meminta pairing code...');
            
            // 7. DELAY SYSTEM - 3 detik sebelum pairing
            setTimeout(async () => {
                try {
                    // 4. TRIGGER PAIRING OTOMATIS
                    const code = await sock.requestPairingCode(phoneNumber);
                    
                    // Format kode menjadi XXXX-XXXX jika memungkinkan
                    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                    console.log(`[ SUCCESS ] Kode pairing: ${formattedCode}`);
                } catch (error) {
                    console.error('[ ERROR ] Gagal meminta pairing code:', error.message);
                    
                    // BONUS: Minta ulang nomor jika gagal
                    console.log('[ SYSTEM ] Menunggu input nomor di console...');
                    console.log('Ketik nomor dengan format 62xxx');
                    process.stdin.resume();
                    process.stdin.on('data', inputHandler);
                }
            }, 3000);
        };

        process.stdin.on('data', inputHandler);
    }
}

startBot();
