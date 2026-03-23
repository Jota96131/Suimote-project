import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { Like } from "../types";

export function useLike() {
  const { user } = useAuth();
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 自分が送ったいいね一覧を取得
  useEffect(() => {
    if (!user) return;

    let ignore = false;

    async function fetchLikes() {
      setLoading(true);
      const { data } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", user!.id);

      if (ignore) return;

      const ids = new Set((data as Pick<Like, "to_user_id">[] ?? []).map((l) => l.to_user_id));
      setLikedUserIds(ids);
      setLoading(false);
    }

    fetchLikes();

    return () => {
      ignore = true;
    };
  }, [user]);

  // いいねを送る
  const sendLike = useCallback(
    async (toUserId: string) => {
      if (!user) return;

      // 楽観的UI更新
      setLikedUserIds((prev) => new Set(prev).add(toUserId));

      const { error } = await supabase
        .from("likes")
        .insert({ from_user_id: user.id, to_user_id: toUserId });

      if (error) {
        // 失敗時にロールバック
        setLikedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(toUserId);
          return next;
        });
      }
    },
    [user]
  );

  // いいねを取り消す
  const removeLike = useCallback(
    async (toUserId: string) => {
      if (!user) return;

      // 楽観的UI更新
      setLikedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(toUserId);
        return next;
      });

      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("from_user_id", user.id)
        .eq("to_user_id", toUserId);

      if (error) {
        // 失敗時にロールバック
        setLikedUserIds((prev) => new Set(prev).add(toUserId));
      }
    },
    [user]
  );

  const isLiked = useCallback(
    (toUserId: string) => likedUserIds.has(toUserId),
    [likedUserIds]
  );

  return { isLiked, sendLike, removeLike, loading };
}
