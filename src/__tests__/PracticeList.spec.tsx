import { render, screen, waitFor } from "@testing-library/react";
import PracticeList from "../components/PracticeList";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRecords = [
  {
    id: "1",
    date: "2024-01-15",
    distance: 1000,
    time: "20:30",
    stroke: "クロール",
    facility: "市民プール",
    memo: null,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    date: "2024-01-10",
    distance: 500,
    time: "10:00",
    stroke: "平泳ぎ",
    facility: "スポーツセンター",
    memo: "フォーム意識",
    created_at: "2024-01-10T09:00:00Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PracticeList", () => {
  // ユニットテスト: ローディング表示
  it("読み込み中に「読み込み中...」を表示する", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn(() => new Promise(() => {})), // 永遠にpending
      }),
    } as any);

    render(<PracticeList />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  // ユニットテスト: 練習記録なし
  it("記録が空の場合「練習記録がありません。」を表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as any);

    render(<PracticeList />);
    await waitFor(() => {
      expect(screen.getByText("練習記録がありません。")).toBeInTheDocument();
    });
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

    render(<PracticeList />);
    await waitFor(() => {
      expect(screen.getByText("エラー: DB接続エラー")).toBeInTheDocument();
    });
  });

  // 結合テスト: 練習記録一覧の表示
  it("練習記録が正しく一覧表示される", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockRecords, error: null }),
      }),
    } as any);

    render(<PracticeList />);

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
    expect(screen.getByText("20:30")).toBeInTheDocument();
    expect(screen.getByText("クロール")).toBeInTheDocument();
    expect(screen.getByText("市民プール")).toBeInTheDocument();

    // 2件目のデータ確認
    expect(screen.getByText("2024-01-10")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("平泳ぎ")).toBeInTheDocument();
    expect(screen.getByText("スポーツセンター")).toBeInTheDocument();
  });

  // 結合テスト: Supabaseが正しいクエリで呼ばれるか
  it("Supabaseのpractice_recordsテーブルを日付降順でfetchする", async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    render(<PracticeList />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("date", { ascending: false });
    });
  });
});
