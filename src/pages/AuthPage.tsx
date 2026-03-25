import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Waves } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const err = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password);

    if (err) {
      setError(err.message);
    } else {
      navigate("/records");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* ロゴ */}
      <Link to="/" className="mb-8 flex items-center gap-2">
        <Waves className="h-8 w-8 text-[#00D4FF]" />
        <span className="text-3xl font-bold text-[#F0F0F0]">
          Sui<span className="text-[#00D4FF]">mote</span>
        </span>
      </Link>

      {/* カード */}
      <div className="w-full max-w-sm rounded-2xl border border-[#1E2640] bg-[#131829] p-6">
        <h1 className="text-center text-xl font-bold text-[#F0F0F0]">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-[#8892A8]">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-[#1E2640] bg-[#0A0E1A] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#8892A8] outline-none focus:border-[#00D4FF] transition"
              placeholder="email@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-[#8892A8]">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl border border-[#1E2640] bg-[#0A0E1A] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#8892A8] outline-none focus:border-[#00D4FF] transition"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#FF3B8B]/10 px-3 py-2 text-sm text-[#FF3B8B]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] px-4 py-3 text-sm font-bold text-[#0A0E1A] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "処理中..." : mode === "login" ? "ログイン" : "登録する"}
          </button>
        </form>
      </div>

      <button
        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
        className="mt-6 text-sm text-[#8892A8] transition hover:text-[#00D4FF]"
      >
        {mode === "login" ? "アカウントをお持ちでない方はこちら" : "ログインはこちら"}
      </button>
    </div>
  );
}
