import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddRecordPage from "../pages/AddRecordPage";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user-id" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function renderAddPage() {
  return render(
    <MemoryRouter initialEntries={["/records/new"]}>
      <Routes>
        <Route path="/records/new" element={<AddRecordPage />} />
        <Route path="/records" element={<div>一覧ページ</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AddRecordPage", () => {
  // フォームUI表示
  it("全ての入力フィールドが表示される", () => {
    renderAddPage();

    expect(screen.getByLabelText("日付")).toBeInTheDocument();
    expect(screen.getByLabelText("距離 (m)")).toBeInTheDocument();
    expect(screen.getByLabelText("タイム (秒)")).toBeInTheDocument();
    expect(screen.getByLabelText("泳法")).toBeInTheDocument();
    expect(screen.getByLabelText("施設名")).toBeInTheDocument();
    expect(screen.getByLabelText("メモ（任意）")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存する" })).toBeInTheDocument();
  });

  // 「← 一覧に戻る」リンク
  it("「← 一覧に戻る」リンクが/recordsを指している", () => {
    renderAddPage();

    const backLink = screen.getByText("← 一覧に戻る");
    expect(backLink.closest("a")).toHaveAttribute("href", "/records");
  });

  // フォームバリデーション: 必須項目が空のまま送信
  it("必須項目が空のまま送信してもINSERTは呼ばれない", async () => {
    const mockInsert = jest.fn();
    mockSupabase.from.mockReturnValue({ insert: mockInsert } as any);

    renderAddPage();

    await userEvent.click(screen.getByRole("button", { name: "保存する" }));

    expect(mockInsert).not.toHaveBeenCalled();
  });

  // 登録処理: 正常系
  it("フォームを入力して保存すると一覧ページに遷移する", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    } as any);

    renderAddPage();

    await userEvent.clear(screen.getByLabelText("日付"));
    await userEvent.type(screen.getByLabelText("日付"), "2024-03-01");
    await userEvent.type(screen.getByLabelText("距離 (m)"), "1000");
    await userEvent.type(screen.getByLabelText("タイム (秒)"), "3600");
    await userEvent.type(screen.getByLabelText("施設名"), "市民プール");

    await userEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(screen.getByText("一覧ページ")).toBeInTheDocument();
    });
  });

  // 登録処理: エラー表示
  it("INSERT失敗時にエラーメッセージが表示される", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({
        error: { message: "保存に失敗しました" },
      }),
    } as any);

    renderAddPage();

    await userEvent.clear(screen.getByLabelText("日付"));
    await userEvent.type(screen.getByLabelText("日付"), "2024-03-01");
    await userEvent.type(screen.getByLabelText("距離 (m)"), "1000");
    await userEvent.type(screen.getByLabelText("タイム (秒)"), "3600");
    await userEvent.type(screen.getByLabelText("施設名"), "市民プール");

    await userEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(screen.getByText("保存に失敗しました")).toBeInTheDocument();
    });
  });

  // 保存中はボタンが無効化される
  it("保存中は「保存中...」と表示されボタンが無効化される", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn(() => new Promise(() => {})), // 永遠にpending
    } as any);

    renderAddPage();

    await userEvent.clear(screen.getByLabelText("日付"));
    await userEvent.type(screen.getByLabelText("日付"), "2024-03-01");
    await userEvent.type(screen.getByLabelText("距離 (m)"), "1000");
    await userEvent.type(screen.getByLabelText("タイム (秒)"), "3600");
    await userEvent.type(screen.getByLabelText("施設名"), "市民プール");

    await userEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "保存中..." });
      expect(button).toBeDisabled();
    });
  });
});
