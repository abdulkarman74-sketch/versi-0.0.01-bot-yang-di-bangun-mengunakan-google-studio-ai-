const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WhatsApp Bot Pairing</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; padding: 0 20px; color: #333; }
          pre { background: #f4f4f4; padding: 15px; border-radius: 8px; overflow-x: auto; }
          h1 { color: #25D366; }
        </style>
      </head>
      <body>
        <h1>WhatsApp Bot Pairing Script</h1>
        <p>Bot sedang berjalan di background. Script <code>pairing.js</code> telah dibuat sesuai dengan permintaan Anda dan siap digunakan di Pterodactyl Panel.</p>
        <h2>Fitur yang diimplementasikan:</h2>
        <ul>
          <li>Input nomor via console (<code>process.stdin</code>) tanpa <code>readline</code> crash.</li>
          <li>Auto detect & validasi nomor (hanya angka, wajib 62xxx).</li>
          <li>Delay 3 detik sebelum request pairing code.</li>
          <li>Session otomatis tersimpan menggunakan <code>useMultiFileAuthState</code>.</li>
          <li>Auto reconnect jika terputus.</li>
        </ul>
        <p>Silakan salin isi file <code>pairing.js</code> dari editor kode di sebelah kiri ke panel Pterodactyl Anda.</p>
      </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Web server listening on port ${port}`);
  // Start the bot
  require('./pairing.js');
});
