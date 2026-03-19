import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UserProfilePage from "../pages/UserProfilePage";

const mockProfile = {
  id: "profile-2",
  user_id: "user-2",
  nickname: "水泳太郎",
  avatar_url: null,
  bio: "毎日泳いでます",
  home_pool: "代々木プール",
  area_id: "area-1",
  matching_opt_in: true,
  created_at: "2024-01-01T00:00:00Z",
  areas: { id: "area-1", name: "渋谷・新宿" },
};

const mockStats = {
  total_distance: 10000,
  total_count: 20,
};

let mockUserProfileState = {
  profile: mockProfile as typeof mockProfile | null,
  stats: mockStats as typeof mockStats | null,
  loading: false,
  error: null as string | null,
};

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

jest.mock("../hooks/useUserProfile", () => ({
  useUserProfile: () => mockUserProfileState,
}));

function renderUserProfilePage(id = "user-2") {
  return render(
    <MemoryRouter initialEntries={[`/users/${id}`]}>
      <Routes>
        <Route path="/users/:id" element={<UserProfilePage />} />
        <Route path="/users" element={<div>ユーザー一覧</div>} />
        <Route path="/profile" element={<div>自分のプロフィール</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUserProfileState = {
    profile: mockProfile,
    stats: mockStats,
    loading: false,
    error: null,
  };
});

describe("UserProfilePage", () => {
  it("matching_opt_in=falseのユーザーにアクセスすると「ユーザーが見つかりません」を表示する", () => {
    // RLSでmatching_opt_in=falseのユーザーはprofileがnullになる
    mockUserProfileState.profile = null;
    mockUserProfileState.stats = null;

    renderUserProfilePage();
    expect(screen.getByText("ユーザーが見つかりません")).toBeInTheDocument();
  });

  it("存在しないユーザーにアクセスすると「ユーザーが見つかりません」を表示する", () => {
    mockUserProfileState.profile = null;
    mockUserProfileState.stats = null;

    renderUserProfilePage("nonexistent-id");
    expect(screen.getByText("ユーザーが見つかりません")).toBeInTheDocument();
  });

  it("「ユーザーが見つかりません」画面にユーザー一覧へのリンクがある", () => {
    mockUserProfileState.profile = null;

    renderUserProfilePage();
    const link = screen.getByText("ユーザー一覧に戻る");
    expect(link.closest("a")).toHaveAttribute("href", "/users");
  });

  it("matching_opt_in=trueのユーザーはプロフィールが表示される", () => {
    renderUserProfilePage();
    expect(screen.getByText("水泳太郎")).toBeInTheDocument();
    expect(screen.getByText("毎日泳いでます")).toBeInTheDocument();
    expect(screen.getByText("代々木プール")).toBeInTheDocument();
  });

  it("累計記録が正しく表示される", () => {
    renderUserProfilePage();
    expect(screen.getByText("10.0 km")).toBeInTheDocument();
    expect(screen.getByText("20 回")).toBeInTheDocument();
  });

  it("自分自身のIDでアクセスすると /profile にリダイレクトする", () => {
    renderUserProfilePage("user-1");
    expect(screen.getByText("自分のプロフィール")).toBeInTheDocument();
  });

  it("読み込み中に「読み込み中...」を表示する", () => {
    mockUserProfileState.loading = true;

    renderUserProfilePage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージを表示する", () => {
    mockUserProfileState.error = "取得に失敗しました";

    renderUserProfilePage();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("取得に失敗しました")).toBeInTheDocument();
  });
});
