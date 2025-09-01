-- 匿名ユーザーがテーブルを読み取れるようにする権限設定

-- local_appsテーブルの権限設定
GRANT SELECT ON TABLE public.local_apps TO anon;
GRANT SELECT ON TABLE public.local_apps TO authenticated;

-- subsidiesテーブルの権限設定
GRANT SELECT ON TABLE public.subsidies TO anon;
GRANT SELECT ON TABLE public.subsidies TO authenticated;

-- topicsテーブルの権限設定
GRANT SELECT ON TABLE public.topics TO anon;
GRANT SELECT ON TABLE public.topics TO authenticated;

-- local_newsテーブルの権限設定
GRANT SELECT ON TABLE public.local_news TO anon;
GRANT SELECT ON TABLE public.local_news TO authenticated;

-- academic_circle_eventsテーブルの権限設定
GRANT SELECT ON TABLE public.academic_circle_events TO anon;
GRANT SELECT ON TABLE public.academic_circle_events TO authenticated;

-- local_media_knowledgeテーブルの権限設定
GRANT SELECT ON TABLE public.local_media_knowledge TO anon;
GRANT SELECT ON TABLE public.local_media_knowledge TO authenticated;

-- regionsテーブルの権限設定
GRANT SELECT ON TABLE public.regions TO anon;
GRANT SELECT ON TABLE public.regions TO authenticated;

-- ビューの権限設定
GRANT SELECT ON TABLE public.v_news_archive TO anon;
GRANT SELECT ON TABLE public.v_news_archive TO authenticated;

-- シーケンスの権限設定
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 管理者用の書き込み権限（post-news Edge Function用）
GRANT INSERT ON TABLE public.local_news TO service_role;
GRANT UPDATE ON TABLE public.local_news TO service_role;

-- fetch-rss Edge Function用の権限
GRANT INSERT ON TABLE public.topics TO service_role;
GRANT UPDATE ON TABLE public.topics TO service_role;
