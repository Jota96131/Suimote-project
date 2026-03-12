import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PracticeList from "../components/PracticeList";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRecords = [
  {
    id: "1",
    date: "2024-01-15",
    distance: 1000,
    time: "1230",
    stroke: "クロール",
    facility: "市民プール",
    memo: null,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    date: "2024-01-10",
    distance: 500,
    time: "600",
    stroke: "平泳ぎ",
    facility: "スポーツセンター",
    memo: "フォーム意識",
    created_at: "2024-01-10T09:00:00Z",
  },
];

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <PracticeList />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PracticeList", () => {
  // ユニットテスト: ローディング表示（スケルトン）
  it("読み込み中にスケルトンテーブルを表示する", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn(() => new Promise(() => {})), // 永遠にpending
      }),
    } as any);

    renderWithRouter();

    // スケルトン表示中もテーブルヘッダーは表示されている
    expect(screen.getByText("日付")).toBeInTheDocument();
    expect(screen.getByText("距離 (m)")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
    expect(screen.getByText("泳法")).toBeInTheDocument();
    expect(screen.getByText("プール施設")).toBeInTheDocument();

    // データ行は表示されていない
    expect(screen.queryByText("練習記録一覧")).not.toBeInTheDocument();
  });

  // ユニットテスト: 練習記録なし
  it("記録が空の場合「練習記録がありません」を表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as any);

    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText("練習記録がありません")).toBeInTheDocument();
    });
    expect(
      screen.getByText("記録を追加すると、ここに表示されます。")
    ).toBeInTheDocument();
  });

  // ユニットテスト: エラー表示
  it("エラーが発生した場合エラーメッセージを表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "DB接続エラー" },
        }),
      }),
    } as any);

    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(screen.getByText("DB接続エラー")).toBeInTheDocument();
    });
  });

  // 結合テスト: 練習記録一覧の表示
  it("練習記録が正しく一覧表示される", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockRecords, error: null }),
      }),
    } as any);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("練習記録一覧")).toBeInTheDocument();
    });

    // テーブルヘッダーの確認
    expect(screen.getByText("日付")).toBeInTheDocument();
    expect(screen.getByText("距離 (m)")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
    expect(screen.getByText("泳法")).toBeInTheDocument();
    expect(screen.getByText("プール施設")).toBeInTheDocument();

    // 1件目のデータ確認
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("クロール")).toBeInTheDocument();
    expect(screen.getByText("市民プール")).toBeInTheDocument();

    // 2件目のデータ確認
    expect(screen.getByText("2024-01-10")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("平泳ぎ")).toBeInTheDocument();
    expect(screen.getByText("スポーツセンター")).toBeInTheDocument();
  });

  // 結合テスト: Supabaseが正しいクエリで呼ばれるか
  it("Supabaseのpractice_recordsテーブルを日付降順でfetchする", async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    renderWithRouter();

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("date", { ascending: false });
    });
  });
});
