// Konfigurasi PM2 untuk menjalankan Next.js (mode `next start`, bukan build standalone Docker).
// Jalankan pertama kali di VPS dengan: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'gadai',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
