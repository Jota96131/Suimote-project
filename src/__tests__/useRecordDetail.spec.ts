import { renderHook, waitFor } from "@testing-library/react";
import { useRecordDetail } from "../hooks/useRecordDetail";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRecord = {
  id: "abc-123",
  date: "2024-01-15",
  distance: 1000,
  time: "1230",
  stroke: "クロール",
  facility: "市民プール",
  memo: "調子良かった",
  created_at: "2024-01-15T10:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useRecordDetail", () => {
  // ユニットテスト: 初期状態
  it("初期状態でloading=true, record=null, error=nullを返す", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn(() => new Promise(() => {})), // 永遠にpending
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRecordDetail("abc-123"));

    expect(result.current.loading).toBe(true);
    expect(result.current.record).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: データ取得成功
  it("データ取得成功後にrecordにデータをセットしloading=falseになる", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRecordDetail("abc-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.record).toEqual(mockRecord);
    expect(result.current.error).toBeNull();
  });

  // ユニットテスト: エラー発生時
  it("エラー発生時にerrorにメッセージをセットしloading=falseになる", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "レコードが見つかりません" },
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRecordDetail("not-exist"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("レコードが見つかりません");
    expect(result.current.record).toBeNull();
  });

  // ユニットテスト: Supabaseクエリの検証
  it("practice_recordsテーブルをidで絞り込んでsingle取得する", async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockRecord, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    renderHook(() => useRecordDetail("abc-123"));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "abc-123");
      expect(mockSingle).toHaveBeenCalled();
    });
  });

  // ユニットテスト: idが変わると再フェッチする
  it("idが変わると新しいidでフェッチし直す", async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockRecord, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

    const { rerender } = renderHook(({ id }) => useRecordDetail(id), {
      initialProps: { id: "abc-123" },
    });

    await waitFor(() => expect(mockEq).toHaveBeenCalledWith("id", "abc-123"));

    rerender({ id: "xyz-456" });

    await waitFor(() => expect(mockEq).toHaveBeenCalledWith("id", "xyz-456"));
  });
});
