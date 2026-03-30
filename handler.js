import config from './config.js';
import { getMenu } from './menu.js';

export async function handleMessages(sock, msg) {
    try {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? msg.key.participant : from;
        const pushName = msg.pushName || "User";
        
        // Dapatkan tipe pesan
        const messageType = Object.keys(msg.message)[0];
        
        // Dapatkan isi pesan (teks)
        let body = '';
        if (messageType === 'conversation') {
            body = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            body = msg.message.extendedTextMessage?.text || '';
        } else if (messageType === 'imageMessage' && msg.message.imageMessage?.caption) {
            body = msg.message.imageMessage.caption;
        } else if (messageType === 'videoMessage' && msg.message.videoMessage?.caption) {
            body = msg.message.videoMessage.caption;
        }

        // Cek apakah pesan menggunakan prefix
        if (!body.startsWith(config.prefix)) return;

        // Pisahkan command dan argumen
        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // Cek apakah pengirim adalah owner
        const isOwner = sender.includes(config.ownerNumber) || msg.key.fromMe;

        // Mode Check
        if (config.mode === 'self' && !isOwner) return;

        // Log command
        console.log(`[COMMAND] ${command} dari ${pushName} (${sender})`);

        switch (command) {
            case 'menu': {
                const menuText = getMenu(pushName);
                await sock.sendMessage(from, { text: menuText }, { quoted: msg });
                break;
            }
            case 'ping': {
                await sock.sendMessage(from, { text: 'Pong! 🏓 Bot aktif dan berjalan lancar.' }, { quoted: msg });
                break;
            }
            case 'self': {
                if (!isOwner) return await sock.sendMessage(from, { text: '❌ Perintah ini hanya untuk owner!' }, { quoted: msg });
                config.mode = 'self';
                await sock.sendMessage(from, { text: '✅ Bot sekarang dalam mode SELF (Hanya merespon owner).' }, { quoted: msg });
                break;
            }
            case 'public': {
                if (!isOwner) return await sock.sendMessage(from, { text: '❌ Perintah ini hanya untuk owner!' }, { quoted: msg });
                config.mode = 'public';
                await sock.sendMessage(from, { text: '✅ Bot sekarang dalam mode PUBLIC (Merespon semua orang).' }, { quoted: msg });
                break;
            }
            default: {
                // Command tidak ditemukan
                break;
            }
        }
    } catch (error) {
        console.error('Error in handler:', error);
    }
}
