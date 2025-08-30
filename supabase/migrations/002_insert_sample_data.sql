-- サンプル地域データ
INSERT INTO regions (code, name) VALUES
  ('tokyo', '東京都'),
  ('osaka', '大阪府'),
  ('kyoto', '京都府'),
  ('fukuoka', '福岡県'),
  ('hokkaido', '北海道')
ON CONFLICT (code) DO NOTHING;

-- サンプルトピック
INSERT INTO topics (headline, summary, source_name, source_url, published_at, is_today, ai_summary) VALUES
  ('デジタル田園都市国家構想の新展開', '政府は地域のデジタル化を加速する新たな施策を発表。5G環境の整備と地域DXの推進に重点。', 'デジタル庁', 'https://example.com/news1', NOW(), true, '地域のデジタル化を推進する新施策が発表されました。'),
  ('高齢者向けスマホ教室の成功事例', '福岡県の公民館で開催されたスマホ教室が好評。参加者の9割が「生活が便利になった」と回答。', '地域ニュース', 'https://example.com/news2', NOW() - INTERVAL '1 hour', true, '高齢者向けスマホ教室が地域で成功を収めています。'),
  ('地域アプリで買い物支援', '京都府の山間部で買い物支援アプリが導入。高齢者の買い物難民問題の解決に貢献。', '京都新聞', 'https://example.com/news3', NOW() - INTERVAL '2 hours', true, '買い物支援アプリが地域課題の解決に貢献しています。');

-- サンプル地域ニュース
INSERT INTO local_news (prefecture, municipality, name, summary, body, source_name, published_at, status, tags) VALUES
  ('東京都', '渋谷区', 'デジタル区役所の取り組み開始', '渋谷区が行政手続きの完全デジタル化を推進。2025年までに9割の手続きをオンライン化へ。', '渋谷区は本日、行政手続きのデジタル化推進計画を発表しました...', '渋谷区役所', NOW() - INTERVAL '1 day', 'published', ARRAY['行政DX', 'オンライン化']),
  ('大阪府', '大阪市', 'シニア向けIT相談会を定期開催', '大阪市内の全区でシニア向けIT相談会を月2回開催。スマートフォンの使い方から行政サービスの利用まで幅広くサポート。', '大阪市は高齢者のデジタルデバイド解消に向けて...', '大阪市', NOW() - INTERVAL '2 days', 'published', ARRAY['シニア支援', 'デジタルデバイド']);

-- サンプル補助金データ
INSERT INTO subsidies (prefecture, municipality, name, summary, issuer, audience, url, apply_start, apply_end, status) VALUES
  ('東京都', NULL, 'デジタル化推進補助金', '中小企業のデジタル化を支援。最大500万円を補助。', '東京都産業労働局', '中小企業', 'https://example.com/subsidy1', '2024-01-01', '2024-12-31', '募集中'),
  ('大阪府', '大阪市', '地域ICT活用支援事業', '地域団体のICT活用を支援。機器購入費用の7割を補助。', '大阪市', '地域団体・NPO', 'https://example.com/subsidy2', '2024-04-01', '2025-03-31', '募集中');

-- サンプルアカデミックサークルイベント
INSERT INTO academic_circle_events (region_id, title, description, venue, start_at, end_at, rsvp_url) VALUES
  (1, 'DLP養成講座 基礎編', 'デジタルライフプランナーとしての基礎知識を学ぶ3日間の集中講座', '東京都千代田区 研修センター', '2024-02-01 09:00:00+09', '2024-02-03 17:00:00+09', 'https://example.com/event1'),
  (2, '地域DX推進セミナー', '成功事例から学ぶ地域のデジタル変革', '大阪府大阪市 コンベンションセンター', '2024-02-15 13:00:00+09', '2024-02-15 17:00:00+09', 'https://example.com/event2');

-- サンプル地域媒体ナレッジ
INSERT INTO local_media_knowledge (region_id, title, description, media_type, url, issued_on, author) VALUES
  (1, 'デジタルライフプランナー実践ガイド 2024年版', '最新のDLP活動事例と実践的なノウハウを収録', 'PDF', 'https://example.com/guide2024.pdf', '2024-01-15', 'DLP協会'),
  (3, '高齢者向けデジタル支援の手引き', '京都府での実践事例を基にした支援マニュアル', 'PDF', 'https://example.com/manual.pdf', '2024-01-10', '京都府');

-- サンプルアクションテーブルデータ（今日の日付で）
INSERT INTO action_tasks (title, category, start_time, end_time, priority, memo, is_completed, created_at, updated_at) VALUES
  ('ロールプレイング練習', 'roleplay', NOW()::date + '08:00:00', NOW()::date + '09:30:00', 'medium', 'クライアント対応の練習', false, NOW(), NOW()),
  ('MTG準備', 'meeting', NOW()::date + '09:30:00', NOW()::date + '10:00:00', 'high', '午後の会議の準備', false, NOW(), NOW()),
  ('資料作成', 'documentation', NOW()::date + '10:00:00', NOW()::date + '11:30:00', 'medium', 'プレゼン資料の作成', false, NOW(), NOW()),
  ('ディスカッション', 'discussion', NOW()::date + '13:00:00', NOW()::date + '14:00:00', 'low', 'チーム内での意見交換', false, NOW(), NOW()),
  ('ラウンド', 'round', NOW()::date + '14:30:00', NOW()::date + '15:30:00', 'medium', '施設見学', false, NOW(), NOW()),
  ('FAS拡張準備', 'fas_preparation', NOW()::date + '16:00:00', NOW()::date + '17:00:00', 'high', '来月の拡張に向けて', false, NOW(), NOW()),
  ('アポイント', 'appointment', NOW()::date + '17:30:00', NOW()::date + '18:00:00', 'high', 'クライアントとの面談', false, NOW(), NOW()),
  ('クリニック関連', 'clinic_related', NOW()::date + '18:30:00', NOW()::date + '19:00:00', 'medium', '設備点検', false, NOW(), NOW()),
  ('メディア・販促制作', 'media_promotion', NOW()::date + '19:00:00', NOW()::date + '19:30:00', 'low', 'SNS投稿作成', false, NOW(), NOW()),
  ('取材活動', 'interview', NOW()::date + '08:00:00', NOW()::date + '10:00:00', 'high', '地域企業への取材', false, NOW(), NOW()),
  ('アカデミックサークル', 'academic_circle', NOW()::date + '10:30:00', NOW()::date + '12:00:00', 'medium', '勉強会参加', false, NOW(), NOW()),
  ('AO校講師活動', 'ao_school_lecturer', NOW()::date + '13:30:00', NOW()::date + '15:00:00', 'high', '高校での講義', false, NOW(), NOW()),
  ('施設準備', 'facility_preparation', NOW()::date + '15:30:00', NOW()::date + '16:30:00', 'medium', '新施設の準備', false, NOW(), NOW()),
  ('レイアウト変更', 'layout_change', NOW()::date + '16:30:00', NOW()::date + '17:00:00', 'low', 'オフィスレイアウト調整', false, NOW(), NOW()),
  ('スキルラーニング', 'skill_learning', NOW()::date + '19:30:00', NOW()::date + '20:00:00', 'medium', '新しいツールの学習', false, NOW(), NOW());