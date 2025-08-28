# Digital Life Planner Dashboard

地域で活動するデジタルライフプランナー（DLP）向けの情報ハブダッシュボードです。

## 機能

- 📰 **本日のトピック**: RSS自動取得、AI要約付き
- 💰 **補助金・助成金**: 地域別の補助金情報
- 📱 **地域アプリ**: 地域で活用できるアプリ情報
- 📝 **地域ニュース**: 地域のデジタル化関連ニュース
- 🎓 **アカデミックサークル**: DLP関連イベント情報
- 📖 **地域媒体ナレッジ**: 資料・マニュアル・ガイドブック
- 📂 **ニュースアーカイブ**: 過去30日間の統合表示

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Supabase (Database, Storage, Edge Functions, Cron)
- **状態管理**: React Hooks + Context API
- **AI要約**: OpenAI API (Edge Functions経由)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Supabaseの設定

Supabaseプロジェクトを作成し、以下の設定を行ってください：

1. データベーステーブルの作成
2. Edge Functionsのデプロイ
3. 環境変数の設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLint実行
- `npm run type-check` - TypeScript型チェック
- `npm run supabase:start` - Supabaseローカル起動
- `npm run db:push` - データベーススキーマ適用
- `npm run functions:deploy` - Edge Functionsデプロイ

## プロジェクト構造

```
/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ダッシュボード
│   ├── search/            # 共通検索画面
│   ├── admin/             # 管理画面
│   ├── archive/           # ニュースアーカイブ
│   ├── events/            # イベント一覧
│   └── knowledge/         # ナレッジ一覧
├── components/            # UIコンポーネント
├── lib/                  # ユーティリティ
└── supabase/            # Supabase関連
    ├── migrations/      # DBマイグレーション
    └── functions/       # Edge Functions
```

## 開発ガイド

### 新しいページの追加

1. `app/`ディレクトリに新しいページファイルを作成
2. 必要に応じてコンポーネントを作成
3. 型定義を`lib/types.ts`に追加

### データベースの変更

1. `supabase/migrations/`に新しいマイグレーションファイルを作成
2. `npm run db:push`でスキーマを適用

### Edge Functionsの変更

1. `supabase/functions/`内の関数を編集
2. `npm run functions:deploy`でデプロイ

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。
