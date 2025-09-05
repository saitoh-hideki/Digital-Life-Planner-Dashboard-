// components/news/DigitalSafetyNewsList.tsx
"use client";

import { LocalNews } from "@/lib/types";
import { filterDigitalSafetyNews } from "@/lib/news";
import { Eye, ExternalLink } from "lucide-react";

interface DigitalSafetyNewsListProps {
  news: LocalNews[];
  onNewsClick: (news: LocalNews) => void;
  limit?: number;
}

export default function DigitalSafetyNewsList({ 
  news, 
  onNewsClick, 
  limit = 6 
}: DigitalSafetyNewsListProps) {
  const safetyNews = filterDigitalSafetyNews(news).slice(0, limit);

  if (!safetyNews.length) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm">
          現在表示できる安心・安全ニュースはありません。引き続き更新をお待ちください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safetyNews.map((newsItem) => (
        <div key={newsItem.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🛡️</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
                  デジタル安心・安全
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {newsItem.name}
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{newsItem.prefecture} {newsItem.municipality}</span>
                  <span>•</span>
                  <span>
                    {new Date(newsItem.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* 詳細ボタン */}
                  <button
                    onClick={() => onNewsClick(newsItem)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors duration-200"
                  >
                    <Eye className="w-3 h-3" />
                    詳細
                  </button>
                  {/* URLボタン */}
                  {newsItem.source_url && (
                    <a
                      href={newsItem.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors duration-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      URL
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}