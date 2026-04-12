import { renderHook, waitFor } from "@testing-library/react";
import { useMonthlyHistory } from "../hooks/useMonthlyHistory";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function mockFrom(resolvedValue: { data: any; error: any }) {
  const mockOrder = jest.fn().mockResolvedValue(resolvedValue);
  const mockGte = jest.fn().mockReturnValue({ order: mockOrder });
  const mockSelect = jest.fn().mockReturnValue({ gte: mockGte });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
  return { mockSelect, mockGte, mockOrder };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useMonthlyHistory", () => {
  it("初期状態でloading=trueを返す", () => {
    const mockOrder = jest.fn(() => new Promise(() => {}));
    const mockGte = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ gte: mockGte });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    const { result } = renderHook(() => useMonthlyHistory());

    expect(result.current.loading).toBe(true);
    expect(result.current.history).toEqual([]);
  });

  it("practice_recordsテーブルからdateカラムを取得する", async () => {
    const { mockSelect } = mockFrom({ data: [], error: null });

    renderHook(() => useMonthlyHistory());

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
      expect(mockSelect).toHaveBeenCalledWith("date");
    });
  });

  it("月別のユニーク練習日数を集計する", async () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    mockFrom({
      data: [
        { date: `${thisMonth}-01` },
        { date: `${thisMonth}-01` }, // 同じ日 → カウント1
        { date: `${thisMonth}-15` },
      ],
      error: null,
    });

    const { result } = renderHook(() => useMonthlyHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 今月のデータを探す
    const thisMonthData = result.current.history.find((h) => h.month === thisMonth);
    expect(thisMonthData?.days).toBe(2); // ユニーク日数 = 2
  });

  it("6ヶ月分のhistoryを返す（データがない月も含む）", async () => {
    mockFrom({ data: [], error: null });

    const { result } = renderHook(() => useMonthlyHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.history).toHaveLength(6);
  });

  it("エラー時はhistoryが空のままになる", async () => {
    mockFrom({ data: null, error: { message: "エラー" } });

    const { result } = renderHook(() => useMonthlyHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.history).toEqual([]);
  });
});
