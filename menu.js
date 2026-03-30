import config from './config.js';

export function getMenu(pushName) {
    return `Halo *${pushName}*! 👋

🤖 *INFO BOT*
- Nama: ${config.botName}
- Status: Aktif 🟢
- Mode: ${config.mode.toUpperCase()}
- Prefix: [ ${config.prefix} ]

📜 *LIST COMMAND*
${config.prefix}menu - Menampilkan menu ini
${config.prefix}ping - Cek status bot
${config.prefix}self - Ubah ke mode self (Owner Only)
${config.prefix}public - Ubah ke mode public (Owner Only)

_Bot WhatsApp Base by Baileys_`;
}
