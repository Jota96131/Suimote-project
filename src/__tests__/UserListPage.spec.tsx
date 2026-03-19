import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UserListPage from "../pages/UserListPage";

const mockMyProfile = {
  id: "profile-1",
  user_id: "user-1",
  nickname: "自分",
  avatar_url: null,
  bio: null,
  home_pool: null,
  area_id: "area-1",
  matching_opt_in: true,
  created_at: "2024-01-01T00:00:00Z",
  areas: { id: "area-1", name: "渋谷・新宿" },
};

const mockUsers = [
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
    stats: { total_distance: 5000, total_count: 10 },
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
    stats: { total_distance: 3000, total_count: 5 },
  },
];

let mockProfileState = {
  profile: mockMyProfile as typeof mockMyProfile | null,
  areas: [],
  loading: false,
  error: null,
  updateProfile: jest.fn(),
};

let mockAreaUsersState = {
  users: mockUsers as typeof mockUsers,
  loading: false,
  error: null as string | null,
};

jest.mock("../hooks/useMyProfile", () => ({
  useMyProfile: () => mockProfileState,
}));

jest.mock("../hooks/useAreaUsers", () => ({
  useAreaUsers: () => mockAreaUsersState,
}));

function renderUserListPage() {
  return render(
    <MemoryRouter initialEntries={["/users"]}>
      <Routes>
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/:id" element={<div>ユーザー詳細</div>} />
        <Route path="/records" element={<div>記録一覧</div>} />
        <Route path="/profile" element={<div>プロフィール</div>} />
        <Route path="/profile/edit" element={<div>プロフィール編集</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockProfileState = {
    profile: mockMyProfile,
    areas: [],
    loading: false,
    error: null,
    updateProfile: jest.fn(),
  };
  mockAreaUsersState = {
    users: mockUsers,
    loading: false,
    error: null,
  };
});

describe("UserListPage", () => {
  it("同じエリアのユーザーが一覧に表示される", () => {
    renderUserListPage();

    expect(screen.getByText("水泳太郎")).toBeInTheDocument();
    expect(screen.getByText("水泳花子")).toBeInTheDocument();
  });

  it("各ユーザーのホームプールが表示される", () => {
    renderUserListPage();

    expect(screen.getByText(/代々木プール/)).toBeInTheDocument();
    expect(screen.getByText(/新宿プール/)).toBeInTheDocument();
  });

  it("各ユーザーの累計記録が表示される", () => {
    renderUserListPage();

    expect(screen.getByText("5.0 km")).toBeInTheDocument();
    expect(screen.getByText("10 回")).toBeInTheDocument();
    expect(screen.getByText("3.0 km")).toBeInTheDocument();
    expect(screen.getByText("5 回")).toBeInTheDocument();
  });

  it("各カードがユーザー詳細ページへのリンクになっている", () => {
    renderUserListPage();

    const taroLink = screen.getByText("水泳太郎").closest("a");
    expect(taroLink).toHaveAttribute("href", "/users/user-2");

    const hanakoLink = screen.getByText("水泳花子").closest("a");
    expect(hanakoLink).toHaveAttribute("href", "/users/user-3");
  });

  it("エリア名が見出しに表示される", () => {
    renderUserListPage();

    expect(screen.getByText("同じエリアのユーザー")).toBeInTheDocument();
    expect(screen.getByText("渋谷・新宿")).toBeInTheDocument();
  });

  it("ユーザーが0人の場合エンプティ状態を表示する", () => {
    mockAreaUsersState.users = [];

    renderUserListPage();
    expect(screen.getByText("同じエリアにマッチング中のユーザーはいません")).toBeInTheDocument();
  });

  it("マッチングOFFの場合「マッチング機能がOFFです」を表示する", () => {
    mockProfileState.profile = { ...mockMyProfile, matching_opt_in: false };

    renderUserListPage();
    expect(screen.getByText("マッチング機能がOFFです")).toBeInTheDocument();
    expect(screen.getByText("マッチング機能をONにすると表示されます")).toBeInTheDocument();
  });

  it("エリア未設定の場合「エリアが設定されていません」を表示する", () => {
    mockProfileState.profile = { ...mockMyProfile, area_id: null, areas: null } as any;

    renderUserListPage();
    expect(screen.getByText("エリアが設定されていません")).toBeInTheDocument();
  });

  it("読み込み中に「読み込み中...」を表示する", () => {
    mockAreaUsersState.loading = true;

    renderUserListPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージを表示する", () => {
    mockAreaUsersState.error = "取得に失敗しました";

    renderUserListPage();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("取得に失敗しました")).toBeInTheDocument();
  });
});
