import { renderHook, waitFor } from "@testing-library/react";
import { usePracticeRecords } from "../hooks/usePracticeRecords";
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
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    date: "2024-01-10",
    distance: 500,
    time: "600",
    stroke: "平泳ぎ",
    facility: "スポーツセンター",
    created_at: "2024-01-10T09:00:00Z",
  },
];

function mockFrom(resolvedValue: { data: any; error: any }) {
  const mockRange = jest.fn().mockResolvedValue(resolvedValue);
  const mockOrder = jest.fn().mockReturnValue({ range: mockRange });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
  return { mockSelect, mockOrder, mockRange };
}

function mockFromPending() {
  const mockRange = jest.fn(() => new Promise(() => {}));
  const mockOrder = jest.fn().mockReturnValue({ range: mockRange });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
  return { mockSelect, mockOrder, mockRange };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("usePracticeRecords", () => {
  // ユニットテスト: 初期状態
  it("初期状態でloading=true, records=[], error=nullを返す", () => {
    mockFromPending();

    const { result } = renderHook(() => usePracticeRecords());

    expect(result.current.loading).toBe(true);
    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: データ取得成功
  it("データ取得成功後にrecordsにデータをセットしloading=falseになる", async () => {
    mockFrom({ data: mockRecords, error: null });

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual(mockRecords);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: 空のデータ
  it("データが空配列の場合records=[]でloading=falseになる", async () => {
    mockFrom({ data: [], error: null });

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: エラー発生時
  it("エラー発生時にerrorにメッセージをセットしloading=falseになる", async () => {
    mockFrom({ data: null, error: { message: "ネットワークエラー" } });

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("ネットワークエラー");
    expect(result.current.records).toEqual([]);
  });

  // ユニットテスト: nullデータをempty配列として扱う
  it("dataがnullの場合はrecords=[]になる（エラーなし）", async () => {
    mockFrom({ data: null, error: null });

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: Supabaseクエリの検証
  it("practice_recordsテーブルを日付降順でクエリする", async () => {
    const { mockSelect, mockOrder, mockRange } = mockFrom({ data: [], error: null });

    renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
      expect(mockSelect).toHaveBeenCalledWith("id, date, distance, time, stroke, facility");
      expect(mockOrder).toHaveBeenCalledWith("date", { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 19);
    });
  });

  // ユニットテスト: hasMoreの判定
  it("取得件数がPAGE_SIZE未満ならhasMore=falseになる", async () => {
    mockFrom({ data: mockRecords, error: null }); // 2件 < 20件

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);
  });
});
