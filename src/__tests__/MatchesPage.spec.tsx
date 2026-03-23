import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MatchesPage from "../pages/MatchesPage";

const mockMatches = [
  {
    id: "profile-2",
    user_id: "user-2",
    nickname: "水泳太郎",
    avatar_url: null,
    bio: null,
    home_pool: "代々木プール",
    area_id: "area-1",
    matching_opt_in: true,
    created_at: "2024-01-01T00:00:00Z",
    areas: { id: "area-1", name: "渋谷・新宿" },
    monthlyCount: 12,
  },
  {
    id: "profile-3",
    user_id: "user-3",
    nickname: "水泳花子",
    avatar_url: null,
    bio: null,
    home_pool: "新宿プール",
    area_id: "area-1",
    matching_opt_in: true,
    created_at: "2024-01-01T00:00:00Z",
    areas: { id: "area-1", name: "渋谷・新宿" },
    monthlyCount: 3,
  },
];

let mockMatchesState = {
  matches: mockMatches as typeof mockMatches,
  loading: false,
  error: null as string | null,
};

jest.mock("../hooks/useMatches", () => ({
  useMatches: () => mockMatchesState,
}));

function renderMatchesPage() {
  return render(
    <MemoryRouter initialEntries={["/matches"]}>
      <Routes>
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/users/:id" element={<div>ユーザー詳細</div>} />
        <Route path="/records" element={<div>記録一覧</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockMatchesState = {
    matches: mockMatches,
    loading: false,
    error: null,
  };
});

describe("MatchesPage", () => {
  it("マッチしたユーザーが一覧に表示される", () => {
    renderMatchesPage();

    expect(screen.getByText("水泳太郎")).toBeInTheDocument();
    expect(screen.getByText("水泳花子")).toBeInTheDocument();
  });

  it("各ユーザーのホームプールが表示される", () => {
    renderMatchesPage();

    expect(screen.getByText("代々木プール")).toBeInTheDocument();
    expect(screen.getByText("新宿プール")).toBeInTheDocument();
  });

  it("各カードがユーザー詳細ページへのリンクになっている", () => {
    renderMatchesPage();

    const taroLink = screen.getByText("水泳太郎").closest("a");
    expect(taroLink).toHaveAttribute("href", "/users/user-2");

    const hanakoLink = screen.getByText("水泳花子").closest("a");
    expect(hanakoLink).toHaveAttribute("href", "/users/user-3");
  });

  it("マッチが0件の場合エンプティメッセージを表示する", () => {
    mockMatchesState.matches = [];

    renderMatchesPage();
    expect(screen.getByText("まだマッチしたユーザーはいません")).toBeInTheDocument();
  });

  it("読み込み中に「読み込み中...」を表示する", () => {
    mockMatchesState.loading = true;

    renderMatchesPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージを表示する", () => {
    mockMatchesState.error = "取得に失敗しました";

    renderMatchesPage();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("取得に失敗しました")).toBeInTheDocument();
  });

  it("月間10回以上のユーザーにゴールドバッジが表示される", () => {
    renderMatchesPage();

    expect(screen.getByText(/ゴールドスイマー/)).toBeInTheDocument();
  });

  it("月間5回未満のユーザーにはバッジが表示されない", () => {
    mockMatchesState.matches = [mockMatches[1]]; // monthlyCount: 3

    renderMatchesPage();
    expect(screen.queryByText(/スイマー/)).not.toBeInTheDocument();
  });
});
