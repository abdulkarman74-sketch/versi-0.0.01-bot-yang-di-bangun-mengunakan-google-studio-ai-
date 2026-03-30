import config from './config.js';
import { getMenu } from './menu.js';

export async function handleMessages(sock, msg, text) {
    try {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? msg.key.participant : from;
        const pushName = msg.pushName || "User";
        
        const prefix = config.prefix || ".";
        const isCmd = text.startsWith(prefix);
        const command = isCmd ? text.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : "";
        const args = text.trim().split(/ +/).slice(1);

        if (!isCmd) return;

        // Cek apakah pengirim adalah owner
        const isOwner = sender.includes(config.ownerNumber) || msg.key.fromMe;

        // Mode Check
        if (config.mode === 'self' && !isOwner) return;

        // Log command
        console.log("Command diterima:", command);
        console.log(`[COMMAND] ${command} dari ${pushName} (${sender})`);

        switch (command) {
            case 'menu': {
                const menuText = `Halo ${pushName}!\n\n*MENU BOT*\n- ${prefix}ping\n- ${prefix}menu\n- ${prefix}self\n- ${prefix}public\n\nBot berjalan stabil di Pterodactyl 🚀`;
                await sock.sendMessage(from, { text: menuText }, { quoted: msg });
                break;
            }
            case 'ping': {
                await sock.sendMessage(from, { text: 'pong' }, { quoted: msg });
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
