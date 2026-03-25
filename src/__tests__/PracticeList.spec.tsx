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
  it("読み込み中にスケルトンを表示する", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn(() => new Promise(() => {})),
      }),
    } as any);

    const { container } = renderWithRouter();
    // スケルトンのカードが表示されている
    const skeletons = container.querySelectorAll(".rounded-2xl");
    expect(skeletons.length).toBeGreaterThan(0);
  });

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

  it("練習記録が正しく一覧表示される", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockRecords, error: null }),
      }),
    } as any);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("クロール")).toBeInTheDocument();
    });

    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("1000m")).toBeInTheDocument();
    expect(screen.getByText("市民プール")).toBeInTheDocument();

    expect(screen.getByText("2024-01-10")).toBeInTheDocument();
    expect(screen.getByText("500m")).toBeInTheDocument();
    expect(screen.getByText("平泳ぎ")).toBeInTheDocument();
    expect(screen.getByText("スポーツセンター")).toBeInTheDocument();
  });

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
