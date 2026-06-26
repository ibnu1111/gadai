# Gadai Service

Sistem Gadai (Pawn) dari nol dengan Node.js + PostgreSQL + Angular, di-deploy ke Railway.

## Tech Stack

- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Frontend:** Angular 18 (Standalone Components)
- **Deploy:** Railway (Backend + PostgreSQL + Static Hosting)

## Project Structure

```
gadai-service/
├── backend/           # API Server
│   ├── prisma/       # Database schema
│   ├── src/          # Source code
│   └── package.json
└── frontend/         # Angular App
    └── src/app/      # Pages, services, models
```

## Quick Start (Development)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push    # Setup local DB
npm run dev           # Start on port 3000
```

### Frontend

```bash
cd frontend
npm install
npm start             # Start on port 4200
```

## Deployment ke Railway

### 1. Buat Project Baru

1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. New Project → Deploy from GitHub repo

### 2. Setup Backend

1. Add PostgreSQL database
2. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key untuk JWT (generate random string)
   - `PORT`: 3000
3. Connect GitHub repo → select backend folder
4. Railway auto-detect Node.js

### 3. Setup Frontend (Static Hosting)

1. Build Angular:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Deploy ke Vercel/Netlify (lebih mudah untuk static):
   ```bash
   npx vercel --prod
   ```
3. Set environment variable untuk API URL

### 4. Update Environment

Update `environment.prod.ts` dengan Railway URL:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-railway-url.up.railway.app/api'
};
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login admin
- `POST /api/auth/register` - Register admin pertama
- `GET /api/auth/profile` - Get admin profile

### Admin Gadai (Auth Required)
- `GET /api/gadai` - List gadai (paginated)
- `GET /api/gadai/:id` - Detail gadai
- `POST /api/gadai` - Create gadai
- `PUT /api/gadai/:id` - Update gadai
- `PUT /api/gadai/:id/status` - Update status
- `DELETE /api/gadai/:id` - Delete gadai
- `GET /api/gadai/summary` - Statistics

### Public (No Auth)
- `POST /api/public/gadai` - Submit gadai baru
- `GET /api/public/gadai/track?phone=` - Track by phone
- `GET /api/public/gadai/:id` - Detail gadai

### Payment (Auth Required)
- `POST /api/payment` - Process payment
- `POST /api/payment/extend` - Extend gadai
- `GET /api/payment/history/:gadaiId` - Payment history

## Gadai Status

| Status | Deskripsi |
|--------|-----------|
| PENDING | Menunggu verifikasi |
| AKTIF | Pinjaman aktif |
| JATUH_TEMPO | Jatuh tempo hari ini |
| OVERDUE | Terlambat |
| LUNAS | Lunas |
| DITOLAK | Ditolak |
| DIPERPANJANG | Diperpanjang |

## First Admin Setup

1. Buka `/admin/login`
2. Karena belum ada admin, akan muncul opsi "Daftar"
3. Isi form registrasi → admin pertama dibuat
4. Login dengan kredensial yang sudah dibuat

## License

MIT
