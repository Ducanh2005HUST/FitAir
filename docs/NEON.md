# Neon (Postgres) setup

## 1) Tạo database trên Neon

- Tạo Project + Database trên Neon
- Lấy connection string dạng Postgres

## 2) Set env cho backend

Tạo file `backend/.env` dựa theo `backend/.env.example` và set:

```bash
DATABASE_URL="postgresql://...your-neon-conn-string...?sslmode=require"
JWT_SECRET="..."
```

Lưu ý: Neon thường yêu cầu `sslmode=require`. Nếu dùng URL có `-pooler` mà migrate bị lỗi P1001, hãy đổi sang “Direct connection” URL (không `-pooler`) để chạy migrate/seed.

## 3) Migrate + seed

```bash
npm run prisma:generate -w @fitair/backend
npm run prisma:migrate -w @fitair/backend
npm run prisma:seed -w @fitair/backend
```

## 4) Run thử

```bash
npm run start:dev -w @fitair/backend
```

Test nhanh:

- `GET http://localhost:4000/health`
- `GET http://localhost:4000/environment/aqi`
