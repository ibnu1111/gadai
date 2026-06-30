# Gadai Service

Sistem Gadai (Pawn) dengan Next.js + PostgreSQL, deployed ke Railway.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Prisma
- **Styling:** Tailwind CSS
- **Deployment:** Railway

## Project Structure

```
gadai-service/
├── prisma/              # Database schema
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API Routes
│   │   ├── admin/      # Admin pages
│   │   ├── create/     # Public create page
│   │   └── track/      # Public track page
│   ├── lib/            # Utilities (prisma, auth, helpers)
│   └── types/          # TypeScript types
└── railway.json        # Railway config
```

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run development server
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login admin
- `POST /api/auth/register` - Register admin pertama
- `GET /api/auth/profile` - Get admin profile

### Gadai (Auth Required)
- `GET /api/gadai` - List gadai
- `GET /api/gadai/summary` - Statistics
- `GET /api/gadai/:id` - Detail gadai
- `POST /api/gadai` - Create gadai
- `PUT /api/gadai/:id` - Update gadai
- `PUT /api/gadai/:id/status` - Update status
- `DELETE /api/gadai/:id` - Delete gadai

### Public (No Auth)
- `POST /api/public/gadai` - Submit gadai baru
- `GET /api/public/track?phone=` - Track by phone

### Payment (Auth Required)
- `POST /api/payment` - Process payment
- `POST /api/payment/extend` - Extend gadai
- `GET /api/payment/history/:gadaiId` - Payment history

## Deployment ke Railway

1. Buat project baru di [railway.app](https://railway.app)
2. Add PostgreSQL database
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key untuk JWT
4. Deploy dari GitHub repo
5. Railway auto-detect Next.js

## First Admin Setup

1. Buka `/admin/login`
2. Klik "Daftar" untuk registrasi admin pertama
3. Login dengan kredensial yang sudah dibuat

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

## License

MIT
