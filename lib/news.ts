// lib/news.ts
import { LocalNews } from '@/lib/types';

export function filterDigitalSafetyNews(news: LocalNews[]): LocalNews[] {
  const safetyKeywords = [
    '防犯', 'セキュリティ', '詐欺', '注意喚起', '個人情報',
    '不審者', '交通安全', '防災', '安全', '危険',
    '警戒', '注意', '警告', '対策', '防止'
  ];

  return news.filter(item => {
    const title = item.name?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    const body = item.body?.toLowerCase() || '';

    return safetyKeywords.some(keyword => 
      title.includes(keyword.toLowerCase()) ||
      category.includes(keyword.toLowerCase()) ||
      body.includes(keyword.toLowerCase())
    );
  });
}