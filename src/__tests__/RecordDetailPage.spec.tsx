import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RecordDetailPage from "../pages/RecordDetailPage";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRecord = {
  id: "abc-123",
  date: "2024-01-15",
  distance: 1000,
  time: "1230", // 秒数: 1230秒 = 20:30
  stroke: "クロール",
  facility: "市民プール",
  memo: "調子良かった",
  created_at: "2024-01-15T10:00:00Z",
};

function renderDetailPage(id = "abc-123") {
  return render(
    <MemoryRouter initialEntries={[`/records/${id}`]}>
      <Routes>
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="/records" element={<div>一覧ページ</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RecordDetailPage", () => {
  // コンポーネントテスト: ローディング表示
  it("読み込み中に「読み込み中...」を表示する", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn(() => new Promise(() => {})), // 永遠にpending
        }),
      }),
    } as any);

    renderDetailPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  // コンポーネントテスト: エラー表示
  it("エラー時に「エラーが発生しました」と詳細メッセージを表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "取得に失敗しました" },
          }),
        }),
      }),
    } as any);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(screen.getByText("取得に失敗しました")).toBeInTheDocument();
    });
    expect(screen.getByText("一覧に戻る")).toBeInTheDocument();
  });

  // コンポーネントテスト: 記録が見つからない
  it("recordがnullの場合「記録が見つかりません」を表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as any);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByText("記録が見つかりません")).toBeInTheDocument();
    });
    expect(screen.getByText("一覧に戻る")).toBeInTheDocument();
  });

  // コンポーネントテスト: 詳細情報の表示
  it("練習記録の詳細情報を正しく表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    } as any);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByText("練習記録詳細")).toBeInTheDocument();
    });

    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("1000 m")).toBeInTheDocument();
    expect(screen.getByText("20:30.00")).toBeInTheDocument(); // 1230秒 → 20:30.00
    expect(screen.getByText("クロール")).toBeInTheDocument();
    expect(screen.getByText("市民プール")).toBeInTheDocument();
    expect(screen.getByText("調子良かった")).toBeInTheDocument();
  });

  // コンポーネントテスト: メモがnullの場合は表示しない
  it("memoがnullの場合はメモ欄を表示しない", async () => {
    const recordWithoutMemo = { ...mockRecord, memo: null };
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: recordWithoutMemo, error: null }),
        }),
      }),
    } as any);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByText("練習記録詳細")).toBeInTheDocument();
    });

    expect(screen.queryByText("メモ")).not.toBeInTheDocument();
  });

  // コンポーネントテスト: 「← 一覧に戻る」リンクの表示
  it("詳細表示時に「一覧に戻る」リンクを表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    } as any);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByText("一覧に戻る")).toBeInTheDocument();
    });

    const backLink = screen.getByText("一覧に戻る");
    expect(backLink.closest("a")).toHaveAttribute("href", "/records");
  });

  // 遷移テスト: URLパラメータのidでフェッチする
  it("URLの:idパラメータを使ってデータをフェッチする", async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockRecord, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    renderDetailPage("abc-123");

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith("id", "abc-123");
    });
  });
});
