import { Link } from "react-router-dom";
import { Waves, Users, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* ロゴ */}
      <div className="mb-2 flex items-center gap-3">
        <Waves className="h-10 w-10 text-[#00D4FF]" />
        <h1 className="text-5xl font-bold tracking-tight text-[#F0F0F0]">
          Sui<span className="text-[#00D4FF]">mote</span>
        </h1>
      </div>

      <p className="mb-12 text-[#8892A8]">
        泳いで、つながる。
      </p>

      {/* CTAボタン */}
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Link
          to="/auth"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] px-6 py-4 text-lg font-bold text-[#0A0E1A] transition hover:opacity-90"
        >
          はじめる
        </Link>

        <Link
          to="/records"
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#1E2640] bg-[#131829] px-6 py-4 text-lg font-medium text-[#F0F0F0] transition hover:border-[#00D4FF]/50"
        >
          練習記録を見る
        </Link>
      </div>

      {/* 特徴 */}
      <div className="mt-16 grid max-w-md grid-cols-3 gap-6 text-center">
        <div>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#00D4FF]/10">
            <Waves className="h-6 w-6 text-[#00D4FF]" />
          </div>
          <p className="text-sm text-[#8892A8]">記録する</p>
        </div>
        <div>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#7B61FF]/10">
            <Users className="h-6 w-6 text-[#7B61FF]" />
          </div>
          <p className="text-sm text-[#8892A8]">見つける</p>
        </div>
        <div>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF3B8B]/10">
            <Heart className="h-6 w-6 text-[#FF3B8B]" />
          </div>
          <p className="text-sm text-[#8892A8]">つながる</p>
        </div>
      </div>
    </div>
  );
}
