import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { Profile, Area } from "../types";

export function useMyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetch() {
      setLoading(true);
      setError(null);

      const [profileRes, areasRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*, areas(id, name)")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase.from("areas").select("*").order("name"),
      ]);

      if (profileRes.error) {
        setError(profileRes.error.message);
      } else {
        setProfile(profileRes.data as Profile);
      }

      if (areasRes.error) {
        setError((prev) => (prev ? `${prev} / ${areasRes.error.message}` : areasRes.error.message));
      } else {
        setAreas(areasRes.data as Area[]);
      }

      setLoading(false);
    }

    fetch();
  }, [user]);

  async function updateProfile(updates: Partial<Pick<Profile, "nickname" | "avatar_url" | "bio" | "home_pool" | "area_id" | "matching_opt_in">>) {
    if (!user) return;
    setError(null);

    const { error: err } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (err) {
      setError(err.message);
      return;
    }

    // 再取得してstateを更新
    const { data, error: refetchErr } = await supabase
      .from("profiles")
      .select("*, areas(id, name)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (refetchErr) {
      setError(refetchErr.message);
    } else {
      setProfile(data as Profile);
    }
  }

  return { profile, areas, loading, error, updateProfile };
}
