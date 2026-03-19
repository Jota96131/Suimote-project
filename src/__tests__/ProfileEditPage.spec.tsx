import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProfileEditPage from "../pages/ProfileEditPage";

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

const mockAreas = [
  { id: "area-1", name: "渋谷・新宿" },
  { id: "area-2", name: "池袋・板橋" },
];

let mockProfileState = {
  profile: mockProfile as typeof mockProfile | null,
  areas: mockAreas,
  loading: false,
  error: null as string | null,
  updateProfile: jest.fn(),
};

jest.mock("../hooks/useMyProfile", () => ({
  useMyProfile: () => mockProfileState,
}));

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

jest.mock("../supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/avatar" } }),
      }),
    },
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

function renderEditPage() {
  return render(
    <MemoryRouter initialEntries={["/profile/edit"]}>
      <Routes>
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile" element={<div>プロフィールページ</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockProfileState = {
    profile: mockProfile,
    areas: mockAreas,
    loading: false,
    error: null,
    updateProfile: jest.fn(),
  };
});

describe("ProfileEditPage", () => {
  it("読み込み中に「読み込み中...」を表示する", () => {
    mockProfileState.loading = true;

    renderEditPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("フェッチエラー時にエラーメッセージを表示する", () => {
    mockProfileState.error = "取得に失敗しました";

    renderEditPage();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("取得に失敗しました")).toBeInTheDocument();
  });

  it("プロフィールの値がフォームに初期表示される", () => {
    renderEditPage();

    expect(screen.getByLabelText("ニックネーム")).toHaveValue("テスト太郎");
    expect(screen.getByLabelText("自己紹介")).toHaveValue("水泳が好きです");
    expect(screen.getByLabelText("ホームプール")).toHaveValue("渋谷区スポーツセンター");
    expect(screen.getByLabelText("所属エリア")).toHaveValue("area-1");
  });

  it("ニックネームが空で保存するとエラーが表示される", () => {
    renderEditPage();

    const nicknameInput = screen.getByLabelText("ニックネーム");
    fireEvent.change(nicknameInput, { target: { value: "" } });
    fireEvent.submit(screen.getByText("保存する"));

    expect(screen.getByText("ニックネームを入力してください")).toBeInTheDocument();
  });

  it("ニックネームがスペースのみで保存するとエラーが表示される", () => {
    renderEditPage();

    const nicknameInput = screen.getByLabelText("ニックネーム");
    fireEvent.change(nicknameInput, { target: { value: "   " } });
    fireEvent.submit(screen.getByText("保存する"));

    expect(screen.getByText("ニックネームを入力してください")).toBeInTheDocument();
  });

  it("ニックネームが20文字を超えるとエラーが表示される", () => {
    renderEditPage();

    const nicknameInput = screen.getByLabelText("ニックネーム");
    fireEvent.change(nicknameInput, { target: { value: "あ".repeat(21) } });
    fireEvent.submit(screen.getByText("保存する"));

    expect(screen.getByText("ニックネームは20文字以内で入力してください")).toBeInTheDocument();
  });

  it("自己紹介が200文字を超えるとエラーが表示される", () => {
    renderEditPage();

    const bioInput = screen.getByLabelText("自己紹介");
    fireEvent.change(bioInput, { target: { value: "あ".repeat(201) } });
    fireEvent.submit(screen.getByText("保存する"));

    expect(screen.getByText("自己紹介は200文字以内で入力してください")).toBeInTheDocument();
  });

  it("ニックネームの文字数カウンターが表示される", () => {
    renderEditPage();
    expect(screen.getByText("5/20文字")).toBeInTheDocument(); // "テスト太郎" = 5文字
  });

  it("自己紹介の文字数カウンターが表示される", () => {
    renderEditPage();
    expect(screen.getByText("7/200文字")).toBeInTheDocument(); // "水泳が好きです" = 7文字
  });

  it("ニックネーム入力で文字数カウンターが更新される", () => {
    renderEditPage();

    const nicknameInput = screen.getByLabelText("ニックネーム");
    fireEvent.change(nicknameInput, { target: { value: "abc" } });

    expect(screen.getByText("3/20文字")).toBeInTheDocument();
  });

  it("バリデーションエラーがある場合、複数のエラーを同時に表示する", () => {
    renderEditPage();

    const nicknameInput = screen.getByLabelText("ニックネーム");
    const bioInput = screen.getByLabelText("自己紹介");
    fireEvent.change(nicknameInput, { target: { value: "" } });
    fireEvent.change(bioInput, { target: { value: "あ".repeat(201) } });
    fireEvent.submit(screen.getByText("保存する"));

    expect(screen.getByText("ニックネームを入力してください")).toBeInTheDocument();
    expect(screen.getByText("自己紹介は200文字以内で入力してください")).toBeInTheDocument();
  });

  it("「← プロフィールに戻る」リンクが /profile を指す", () => {
    renderEditPage();
    const backLink = screen.getByText("← プロフィールに戻る");
    expect(backLink.closest("a")).toHaveAttribute("href", "/profile");
  });

  it("保存成功後に /profile へ遷移する", async () => {
    renderEditPage();

    fireEvent.submit(screen.getByText("保存する"));

    await waitFor(() => {
      expect(screen.getByText("プロフィールページ")).toBeInTheDocument();
    });
  });
});
