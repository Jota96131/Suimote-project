-- =============================================
-- N+1 クエリ問題を解消するバッチ RPC 関数
-- エリアユーザー・マッチユーザーの統計を1回で返す
-- =============================================

-- エリア内ユーザー一覧 + 統計を一括取得
CREATE OR REPLACE FUNCTION get_area_users_with_stats(p_area_id UUID, p_exclude_user_id UUID)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      p.user_id,
      p.nickname,
      p.bio,
      p.home_pool,
      p.area_id,
      p.matching_opt_in,
      p.avatar_url,
      json_build_object('id', a.id, 'name', a.name) AS areas,
      COALESCE(
        (SELECT json_build_object(
          'total_distance', COALESCE(SUM(pr.distance), 0),
          'total_count', COUNT(*)
        ) FROM practice_records pr WHERE pr.user_id = p.user_id),
        json_build_object('total_distance', 0, 'total_count', 0)
      ) AS stats,
      COALESCE(
        (SELECT COUNT(*)::integer
         FROM practice_records pr
         WHERE pr.user_id = p.user_id
           AND pr.date::text >= to_char(NOW(), 'YYYY-MM-01')),
        0
      ) AS "monthlyCount"
    FROM profiles p
    LEFT JOIN areas a ON a.id = p.area_id
    WHERE p.area_id = p_area_id
      AND p.matching_opt_in = true
      AND p.user_id != p_exclude_user_id
  ) t;
$$;

-- マッチユーザー一覧 + 月間練習回数を一括取得
CREATE OR REPLACE FUNCTION get_matched_users_with_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      p.user_id,
      p.nickname,
      p.bio,
      p.home_pool,
      p.area_id,
      p.matching_opt_in,
      p.avatar_url,
      json_build_object('id', a.id, 'name', a.name) AS areas,
      COALESCE(
        (SELECT COUNT(*)::integer
         FROM practice_records pr
         WHERE pr.user_id = p.user_id
           AND pr.date::text >= to_char(NOW(), 'YYYY-MM-01')),
        0
      ) AS "monthlyCount"
    FROM profiles p
    LEFT JOIN areas a ON a.id = p.area_id
    WHERE p.user_id IN (
      -- 相互いいね = マッチ
      SELECT l1.to_user_id
      FROM likes l1
      INNER JOIN likes l2
        ON l1.from_user_id = l2.to_user_id
        AND l1.to_user_id = l2.from_user_id
      WHERE l1.from_user_id = auth.uid()
    )
  ) t;
$$;
