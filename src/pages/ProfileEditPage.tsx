import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import { supabase } from "../supabase";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuth } from "../hooks/useAuth";
import { resizeImage } from "../utils/resizeImage";
import AreaDropdown from "../components/AreaDropdown";
import type { Profile, Area } from "../types";

const inputClass =
  "rounded-xl border border-[#1E2640] bg-[#0A0E1A] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#8892A8] outline-none focus:border-[#00D4FF] transition";

export default function ProfileEditPage() {
  const { user } = useAuth();
  const { profile, areas, loading, error: fetchError } = useMyProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#8892A8]">読み込み中...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#FF3B8B]">エラーが発生しました</p>
        <p className="mt-1 text-sm text-[#8892A8]">{fetchError}</p>
        <Link to="/profile" className="mt-4 text-sm text-[#00D4FF]">
          プロフィールに戻る
        </Link>
      </div>
    );
  }

  return <ProfileEditForm user={user} profile={profile} areas={areas} />;
}

type FormProps = {
  user: { id: string } | null;
  profile: Profile | null;
  areas: Area[];
};

function ProfileEditForm({ user, profile, areas }: FormProps) {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [homePool, setHomePool] = useState(profile?.home_pool ?? "");
  const [areaId, setAreaId] = useState(profile?.area_id ?? "");
  const [matchingOptIn, setMatchingOptIn] = useState(profile?.matching_opt_in ?? false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      setAvatarFile(resized);
      setAvatarPreview(URL.createObjectURL(resized));
    } catch {
      setError("画像の処理に失敗しました");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const errors: Record<string, string> = {};
    if (nickname.trim().length === 0) {
      errors.nickname = "ニックネームを入力してください";
    } else if (nickname.length > 20) {
      errors.nickname = "ニックネームは20文字以内で入力してください";
    }
    if (bio.length > 200) {
      errors.bio = "自己紹介は200文字以内で入力してください";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);

    try {
      let avatarUrl = profile?.avatar_url ?? null;

      if (avatarFile) {
        const filePath = `${user.id}/avatar`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadErr) {
          setError(uploadErr.message);
          setSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      const { error: updateErr } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          nickname,
          bio: bio || null,
          home_pool: homePool || null,
          area_id: areaId || null,
          avatar_url: avatarUrl,
          matching_opt_in: matchingOptIn,
        });

      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }

      navigate("/profile");
    } catch {
      setError("保存に失敗しました");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link to="/profile" className="flex items-center gap-1 text-sm text-[#8892A8] hover:text-[#00D4FF] transition">
        <ArrowLeft className="h-4 w-4" />
        プロフィールに戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold text-[#F0F0F0]">プロフィール編集</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* アバター */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#00D4FF]/10">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-[#00D4FF]" />
            )}
          </div>
          <label className="cursor-pointer text-sm text-[#00D4FF]">
            画像を変更
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* ニックネーム */}
        <div className="flex flex-col gap-1">
          <label htmlFor="nickname" className="text-sm font-medium text-[#8892A8]">
            ニックネーム
          </label>
          <input
            id="nickname"
            type="text"
            autoComplete="off"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            minLength={1}
            maxLength={20}
            className={inputClass}
          />
          <p className="text-xs text-[#8892A8]">{nickname.length}/20文字</p>
          {fieldErrors.nickname && (
            <p className="text-xs text-[#FF3B8B]">{fieldErrors.nickname}</p>
          )}
        </div>

        {/* 自己紹介 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-sm font-medium text-[#8892A8]">
            自己紹介
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            className={inputClass}
          />
          <p className="text-xs text-[#8892A8]">{bio.length}/200文字</p>
          {fieldErrors.bio && (
            <p className="text-xs text-[#FF3B8B]">{fieldErrors.bio}</p>
          )}
        </div>

        {/* ホームプール */}
        <div className="flex flex-col gap-1">
          <label htmlFor="homePool" className="text-sm font-medium text-[#8892A8]">
            ホームプール
          </label>
          <input
            id="homePool"
            type="text"
            value={homePool}
            onChange={(e) => setHomePool(e.target.value)}
            className={inputClass}
            placeholder="例: 渋谷区スポーツセンター"
          />
        </div>

        {/* エリア */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#8892A8]">
            所属エリア
          </label>
          <AreaDropdown
            areas={areas}
            value={areaId}
            onChange={setAreaId}
            className={inputClass}
          />
        </div>

        {/* マッチング機能 */}
        <div className="flex items-center justify-between rounded-xl border border-[#1E2640] bg-[#131829] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#F0F0F0]">マッチング機能</p>
            <p className="text-xs text-[#8892A8]">
              ONにすると他のユーザーとマッチングできます
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={matchingOptIn}
            onClick={() => setMatchingOptIn(!matchingOptIn)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              matchingOptIn ? "bg-[#00D4FF]" : "bg-[#1E2640]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                matchingOptIn ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-[#FF3B8B]/10 px-3 py-2 text-sm text-[#FF3B8B]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] px-4 py-3 text-sm font-bold text-[#0A0E1A] transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
