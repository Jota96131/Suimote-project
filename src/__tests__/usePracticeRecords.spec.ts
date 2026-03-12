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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("usePracticeRecords", () => {
  // ユニットテスト: 初期状態
  it("初期状態でloading=true, records=[], error=nullを返す", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn(() => new Promise(() => {})), // 永遠にpending
      }),
    } as any);

    const { result } = renderHook(() => usePracticeRecords());

    expect(result.current.loading).toBe(true);
    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: データ取得成功
  it("データ取得成功後にrecordsにデータをセットしloading=falseになる", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockRecords, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual(mockRecords);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: 空のデータ
  it("データが空配列の場合records=[]でloading=falseになる", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as any);

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: エラー発生時
  it("エラー発生時にerrorにメッセージをセットしloading=falseになる", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "ネットワークエラー" },
        }),
      }),
    } as any);

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("ネットワークエラー");
    expect(result.current.records).toEqual([]);
  });

  // ユニットテスト: nullデータをempty配列として扱う
  it("dataがnullの場合はrecords=[]になる（エラーなし）", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: Supabaseクエリの検証
  it("practice_recordsテーブルを日付降順でクエリする", async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    renderHook(() => usePracticeRecords());

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("date", { ascending: false });
    });
  });
});
