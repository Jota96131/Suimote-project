import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { Like } from "../types";

export function useLike() {
  const { user } = useAuth();
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const receivedIdsRef = useRef<Set<string>>(new Set());

  // 自分が送った/もらったいいね一覧を取得してマッチ判定
  useEffect(() => {
    if (!user) return;

    let ignore = false;

    async function fetchLikes() {
      setLoading(true);

      // 自分が送ったいいね
      const { data: sent } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", user!.id);

      // 自分がもらったいいね
      const { data: received } = await supabase
        .from("likes")
        .select("from_user_id")
        .eq("to_user_id", user!.id);

      if (ignore) return;

      const sentIds = new Set(
        (sent as Pick<Like, "to_user_id">[] ?? []).map((l) => l.to_user_id)
      );
      const receivedIds = new Set(
        (received as Pick<Like, "from_user_id">[] ?? []).map((l) => l.from_user_id)
      );

      // 相互いいね = 自分が送った & 相手からももらった
      const matched = new Set<string>();
      sentIds.forEach((id) => {
        if (receivedIds.has(id)) matched.add(id);
      });

      receivedIdsRef.current = receivedIds;
      setLikedUserIds(sentIds);
      setMatchedUserIds(matched);
      setLoading(false);
    }

    fetchLikes();

    return () => {
      ignore = true;
    };
  }, [user]);

  // いいねを送る（マッチ成立したかどうかを返す）
  const sendLike = useCallback(
    async (toUserId: string): Promise<boolean> => {
      if (!user) return false;

      // クライアント側で即マッチ判定（相手が既にいいね済みか）
      const isMutual = receivedIdsRef.current.has(toUserId);

      // 楽観的UI更新
      setLikedUserIds((prev) => new Set(prev).add(toUserId));
      if (isMutual) {
        setMatchedUserIds((prev) => new Set(prev).add(toUserId));
      }

      const { error } = await supabase
        .from("likes")
        .insert({ from_user_id: user.id, to_user_id: toUserId });

      if (error) {
        setLikedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(toUserId);
          return next;
        });
        if (isMutual) {
          setMatchedUserIds((prev) => {
            const next = new Set(prev);
            next.delete(toUserId);
            return next;
          });
        }
        return false;
      }

      return isMutual;
    },
    [user]
  );

  // いいねを取り消す
  const removeLike = useCallback(
    async (toUserId: string) => {
      if (!user) return;

      setLikedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(toUserId);
        return next;
      });
      setMatchedUserIds((prev) => {
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
        setLikedUserIds((prev) => new Set(prev).add(toUserId));
      }
    },
    [user]
  );

  const isLiked = useCallback(
    (toUserId: string) => likedUserIds.has(toUserId),
    [likedUserIds]
  );

  const isMatched = useCallback(
    (toUserId: string) => matchedUserIds.has(toUserId),
    [matchedUserIds]
  );

  const isReceivedLike = useCallback(
    (fromUserId: string) => receivedIdsRef.current.has(fromUserId),
    []
  );

  return { isLiked, isMatched, isReceivedLike, sendLike, removeLike, loading };
}
