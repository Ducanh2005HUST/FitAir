# FitAir

Monorepo gồm:

- `backend/`: NestJS (TypeScript) + Prisma (Postgres/Neon)
- `frontend/`: Vite + React (UI bundle “Health & Fitness Platform UI”)
- `frontend-next-old/`: frontend Next.js cũ (không dùng nữa)

## Yêu cầu

- Node.js >= 20
- Neon Postgres (hoặc Postgres thường)

## Cài dependencies

```bash
cd /Users/mac/Downloads/FitAir
npm install
```

## Thiết lập môi trường (không commit `.env`)

Backend env:

- Tạo file `backend/.env` dựa theo `backend/.env.example`
- Điền `DATABASE_URL` (Neon/PG)

Frontend env:

- Tạo file `frontend/.env.local` dựa theo `frontend/.env.example`
- `VITE_API_BASE_URL` mặc định: `http://127.0.0.1:4000`

## Chạy backend (NestJS)

```bash
cd /Users/mac/Downloads/FitAir

npm run prisma:generate -w @fitair/backend
# Lần đầu setup DB:
npm run prisma:migrate:init -w @fitair/backend
npm run prisma:seed -w @fitair/backend

npm run start:dev -w @fitair/backend
```

Test nhanh:

```bash
curl http://localhost:4000/health
```

## Chạy frontend (Vite)

```bash
cd /Users/mac/Downloads/FitAir
npm run dev -w @fitair/frontend
```

Mở:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Chạy cả 2 cùng lúc

```bash
cd /Users/mac/Downloads/FitAir
npm run dev
```

## Neon (Postgres)

Xem thêm: `docs/NEON.md`

