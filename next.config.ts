import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 開発サーバーの安定性向上
  experimental: {
    // 無効な設定を削除
  },
  // ファイル監視の設定
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 開発時のファイル監視を最適化
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
  // ワークスペースルートの警告を解決
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
