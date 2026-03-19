import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProfilePage from "../pages/ProfilePage";

const mockProfile = {
  id: "profile-1",
  user_id: "user-1",
  nickname: "テスト太郎",
  avatar_url: null,
  bio: "水泳が好きです",
  home_pool: "渋谷区スポーツセンター",
  area_id: "area-1",
  matching_opt_in: false,
  created_at: "2024-01-01T00:00:00Z",
  areas: { id: "area-1", name: "渋谷・新宿" },
};

const mockStats = {
  total_distance: 5000,
  total_count: 10,
};

const mockUpdateProfile = jest.fn();

let mockProfileState = {
  profile: mockProfile as typeof mockProfile | null,
  loading: false,
  error: null as string | null,
  areas: [],
  updateProfile: mockUpdateProfile,
};

let mockStatsState = {
  stats: mockStats as typeof mockStats | null,
  loading: false,
};

jest.mock("../hooks/useMyProfile", () => ({
  useMyProfile: () => mockProfileState,
}));

jest.mock("../hooks/useMyStats", () => ({
  useMyStats: () => mockStatsState,
}));

function renderProfilePage() {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<div>編集ページ</div>} />
        <Route path="/records" element={<div>記録一覧</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockProfileState = {
    profile: mockProfile,
    loading: false,
    error: null,
    areas: [],
    updateProfile: mockUpdateProfile,
  };
  mockStatsState = {
    stats: mockStats,
    loading: false,
  };
});

describe("ProfilePage", () => {
  it("読み込み中に「読み込み中...」を表示する", () => {
    mockProfileState.loading = true;

    renderProfilePage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージを表示する", () => {
    mockProfileState.error = "取得に失敗しました";

    renderProfilePage();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("取得に失敗しました")).toBeInTheDocument();
  });

  it("プロフィールがnullの場合「プロフィールが見つかりません」を表示する", () => {
    mockProfileState.profile = null;

    renderProfilePage();
    expect(screen.getByText("プロフィールが見つかりません")).toBeInTheDocument();
  });

  it("ニックネームを正しく表示する", () => {
    renderProfilePage();
    expect(screen.getByText("テスト太郎")).toBeInTheDocument();
  });

  it("エリア名を正しく表示する", () => {
    renderProfilePage();
    const areas = screen.getAllByText("渋谷・新宿");
    expect(areas.length).toBe(2); // ニックネーム横 + 所属エリア欄
  });

  it("累計距離を正しく表示する", () => {
    renderProfilePage();
    expect(screen.getByText("5.0 km")).toBeInTheDocument();
  });

  it("累計回数を正しく表示する", () => {
    renderProfilePage();
    expect(screen.getByText("10 回")).toBeInTheDocument();
  });

  it("自己紹介を正しく表示する", () => {
    renderProfilePage();
    expect(screen.getByText("水泳が好きです")).toBeInTheDocument();
  });

  it("ホームプールを正しく表示する", () => {
    renderProfilePage();
    expect(screen.getByText("渋谷区スポーツセンター")).toBeInTheDocument();
  });

  it("マッチングOFFの場合「マッチング機能はOFFです」メッセージを表示する", () => {
    renderProfilePage();
    expect(
      screen.getByText("マッチング機能はOFFです。ONにすると同じエリアのユーザーと出会えます")
    ).toBeInTheDocument();
  });

  it("マッチングONの場合「マッチング機能が有効です」メッセージを表示する", () => {
    mockProfileState.profile = { ...mockProfile, matching_opt_in: true };

    renderProfilePage();
    expect(screen.getByText("マッチング機能が有効です")).toBeInTheDocument();
  });

  it("累計記録が読み込み中の場合「...」を表示する", () => {
    mockStatsState.loading = true;

    renderProfilePage();
    const dots = screen.getAllByText("...");
    expect(dots.length).toBe(2);
  });

  it("「編集する」リンクが /profile/edit を指す", () => {
    renderProfilePage();
    const editLink = screen.getByText("編集する");
    expect(editLink.closest("a")).toHaveAttribute("href", "/profile/edit");
  });

  it("「← 記録一覧に戻る」リンクが /records を指す", () => {
    renderProfilePage();
    const backLink = screen.getByText("← 記録一覧に戻る");
    expect(backLink.closest("a")).toHaveAttribute("href", "/records");
  });

  it("OFFからONに切り替えると確認ダイアログ後にupdateProfileが呼ばれる", () => {
    window.confirm = jest.fn().mockReturnValue(true);

    renderProfilePage();
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(window.confirm).toHaveBeenCalledWith(
      "プロフィールが他のユーザーに表示されます。よろしいですか？"
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith({ matching_opt_in: true });
  });

  it("OFFからONの確認ダイアログでキャンセルするとupdateProfileが呼ばれない", () => {
    window.confirm = jest.fn().mockReturnValue(false);

    renderProfilePage();
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("ONからOFFに切り替えると確認ダイアログなしでupdateProfileが呼ばれる", () => {
    mockProfileState.profile = { ...mockProfile, matching_opt_in: true };
    window.confirm = jest.fn();

    renderProfilePage();
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockUpdateProfile).toHaveBeenCalledWith({ matching_opt_in: false });
  });
});
