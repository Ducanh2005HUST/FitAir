# FitAir

モノレポ構成:

- `backend/`: NestJS (TypeScript) + Prisma（Postgres / Neon）
- `frontend/`: Vite + React（UI bundle “Health & Fitness Platform UI”）
- `frontend-next-old/`: 旧 Next.js フロントエンド（現在は未使用）

## 必要要件

- Node.js >= 20
- Neon Postgres（または通常の Postgres）

## 依存関係のインストール

```bash
cd /Users/mac/Downloads/FitAir
npm install
```

## 環境変数の設定（`.env` はコミットしない）

Backend:

- `backend/.env.example` を元に `backend/.env` を作成
- `DATABASE_URL`（Neon / PG）を設定

Frontend:

- `frontend/.env.example` を元に `frontend/.env.local` を作成
- `VITE_API_BASE_URL` のデフォルト: `http://127.0.0.1:4000`

## SerpApi (Google Maps Local Results)

Backend は SerpApi（優先）を使って現在地周辺のジム/公園を取得し、DB に upsert します（Spot/Review などで共通利用）。

- `backend/.env` に `SERPAPI_API_KEY` を設定
- Backend を再起動
- Frontend は位置情報の許可後、`lat/lng` を API に送信します（Dashboard/Map など）

## YouTube search (Indoor training)

- 最新動画の取得方法:
  - （推奨）SerpApi: `backend/.env` に `SERPAPI_API_KEY`（engine `youtube` を使用）
  - YouTube Data API: `backend/.env` に `YOUTUBE_API_KEY`
- 管理用 API `POST /videos/sync` を呼び出して DB を更新します

## Push notifications (Web Push)

ブラウザ通知（対応ブラウザの通知センター/ロック画面）には Web Push + VAPID を利用します:

```bash
cd /Users/mac/Downloads/FitAir
npx web-push generate-vapid-keys
```

`backend/.env` に設定:

- `VAPID_PUBLIC_KEY=...`
- `VAPID_PRIVATE_KEY=...`
- `VAPID_SUBJECT=mailto:...`

アプリ内の通知（ベル）から「プッシュ通知を有効化」を押してデバイス登録します。

## AQI 室内推奨の通知（Push + Gmail）

- デフォルト閾値: `AQI > 40` で「室内トレーニング推奨」を通知（1日1回/ユーザー）
- 変更する場合は `backend/.env` に `AQI_INDOOR_THRESHOLD=40` のように設定します

## Backend 起動（NestJS）

```bash
cd /Users/mac/Downloads/FitAir

npm run prisma:generate -w @fitair/backend
# 初回 DB セットアップ（Neon は pooler URL だと migrate が止まる場合があるため、まず db push 推奨）:
# NOTE: Prisma 実行時の `DATABASE_URL` は `-pooler` なし（Direct）を推奨
cd backend
npx prisma db push
cd ..
npm run prisma:seed -w @fitair/backend

# 以前のデモデータを削除:
npm run prisma:purge:demo -w @fitair/backend

npm run start:dev -w @fitair/backend
```

動作確認:

```bash
curl http://localhost:4000/health
```

## Frontend 起動（Vite）

```bash
cd /Users/mac/Downloads/FitAir
npm run dev -w @fitair/frontend
```

アクセス:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Backend + Frontend 同時起動

```bash
cd /Users/mac/Downloads/FitAir
npm run dev
```

## Neon (Postgres)

詳細: `docs/NEON.md`
