import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User } from "lucide-react";
import { supabase } from "../supabase";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuth } from "../hooks/useAuth";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, areas, loading, error: fetchError } = useMyProfile();

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

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // バリデーション
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

      // アバター画像をアップロード
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

      // プロフィールを更新（なければ新規作成）
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-destructive">エラーが発生しました</p>
        <p className="mt-1 text-sm text-muted-foreground">{fetchError}</p>
        <Link to="/profile" className="mt-4 text-sm underline">
          プロフィールに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/profile" className="text-sm underline">
        ← プロフィールに戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold">プロフィール編集</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* アバター */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10" />
            )}
          </div>
          <label className="cursor-pointer text-sm text-blue-600 underline">
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
          <label htmlFor="nickname" className="text-sm font-medium">
            ニックネーム
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            minLength={1}
            maxLength={20}
            className="rounded border px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {nickname.length}/20文字
          </p>
          {fieldErrors.nickname && (
            <p className="text-xs text-red-600">{fieldErrors.nickname}</p>
          )}
        </div>

        {/* 自己紹介 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-sm font-medium">
            自己紹介
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            className="rounded border px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {bio.length}/200文字
          </p>
          {fieldErrors.bio && (
            <p className="text-xs text-red-600">{fieldErrors.bio}</p>
          )}
        </div>

        {/* ホームプール */}
        <div className="flex flex-col gap-1">
          <label htmlFor="homePool" className="text-sm font-medium">
            ホームプール
          </label>
          <input
            id="homePool"
            type="text"
            value={homePool}
            onChange={(e) => setHomePool(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        {/* エリア */}
        <div className="flex flex-col gap-1">
          <label htmlFor="areaId" className="text-sm font-medium">
            所属エリア
          </label>
          <select
            id="areaId"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">未選択</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* マッチング機能 */}
        <div className="flex items-center justify-between rounded border px-3 py-3">
          <div>
            <p className="text-sm font-medium">マッチング機能</p>
            <p className="text-xs text-muted-foreground">
              ONにすると他のユーザーとマッチングできます
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={matchingOptIn}
            onClick={() => setMatchingOptIn(!matchingOptIn)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              matchingOptIn ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                matchingOptIn ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
