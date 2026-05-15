# Neon（Postgres）セットアップ

## 1) Neon で DB を作成

- Neon で Project + Database を作成
- Postgres の接続文字列（connection string）を取得

## 2) Backend の環境変数を設定

`backend/.env.example` を元に `backend/.env` を作成して設定:

```bash
DATABASE_URL="postgresql://...your-neon-conn-string...?sslmode=require"
JWT_SECRET="..."
```

注意: Neon は通常 `sslmode=require` が必要です。`-pooler` の URL で migrate が P1001 になる場合は、Neon の “Direct connection”（`-pooler` なし）URL を使って migrate/seed を実行してください。

## 3) Migrate + seed

```bash
npm run prisma:generate -w @fitair/backend
npm run prisma:migrate -w @fitair/backend
npm run prisma:seed -w @fitair/backend
```

## 4) 起動

```bash
npm run start:dev -w @fitair/backend
```

動作確認:

- `GET http://localhost:4000/health`
- `GET http://localhost:4000/environment/aqi`
