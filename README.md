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

## SerpApi (Google Maps Local Results)

Backend có thể lấy danh sách gym/công viên quanh vị trí người dùng thông qua SerpApi (ưu tiên), và tự lưu (upsert) vào DB để các màn hình Spot/Review dùng chung.

- Điền `SERPAPI_API_KEY` trong `backend/.env`
- Restart backend
- Frontend sẽ tự xin quyền location và gửi `lat/lng` lên API khi load trang Dashboard/Map/Search

## YouTube search (Indoor training)

- Bạn có 2 cách lấy video mới nhất:
  - (Khuyến nghị) Dùng SerpApi: điền `SERPAPI_API_KEY` trong `backend/.env` (backend sẽ dùng engine `youtube`)
  - Hoặc dùng YouTube Data API: điền `YOUTUBE_API_KEY` trong `backend/.env`
- Frontend dùng nút `最新を取得 / Load latest` để gọi `POST /videos/sync` và cập nhật DB

## Chạy backend (NestJS)

```bash
cd /Users/mac/Downloads/FitAir

npm run prisma:generate -w @fitair/backend
# Lần đầu setup DB:
npm run prisma:migrate:init -w @fitair/backend
npm run prisma:seed -w @fitair/backend

# Nếu DB trước đây đã seed demo, xoá demo:
npm run prisma:purge:demo -w @fitair/backend

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
