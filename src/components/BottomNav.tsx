import { Link, useLocation } from "react-router-dom";
import { Waves, User, Users, Heart, Weight } from "lucide-react";

const NAV_ITEMS = [
  { to: "/records", icon: Waves, label: "記録" },
  { to: "/weight", icon: Weight, label: "体重" },
  { to: "/users", icon: Users, label: "さがす" },
  { to: "/matches", icon: Heart, label: "マッチ" },
  { to: "/profile", icon: User, label: "マイページ" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1E2640] bg-[#0A0E1A]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition ${
                isActive
                  ? "text-[#00D4FF]"
                  : "text-[#8892A8] hover:text-[#F0F0F0]"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_#00D4FF]" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
