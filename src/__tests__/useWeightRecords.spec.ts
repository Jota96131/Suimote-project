import { renderHook, waitFor } from "@testing-library/react";
import { useWeightRecords } from "../hooks/useWeightRecords";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRecords = [
  { id: "w1", user_id: "user-1", date: "2024-03-15", weight: 70.5, created_at: "2024-03-15T10:00:00Z" },
  { id: "w2", user_id: "user-1", date: "2024-03-10", weight: 71.0, created_at: "2024-03-10T10:00:00Z" },
];

function mockFrom(resolvedValue: { data: any; error: any }) {
  const mockLimit = jest.fn().mockResolvedValue(resolvedValue);
  const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
  return { mockSelect, mockOrder, mockLimit };
}

function mockFromPending() {
  const mockLimit = jest.fn(() => new Promise(() => {}));
  const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useWeightRecords", () => {
  it("初期状態でloading=trueを返す", () => {
    mockFromPending();

    const { result } = renderHook(() => useWeightRecords());

    expect(result.current.loading).toBe(true);
    expect(result.current.records).toEqual([]);
  });

  it("データ取得成功後にrecordsにデータをセットする", async () => {
    mockFrom({ data: mockRecords, error: null });

    const { result } = renderHook(() => useWeightRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual(mockRecords);
    expect(result.current.error).toBeNull();
  });

  it("weight_recordsテーブルをクエリする", async () => {
    const { mockSelect } = mockFrom({ data: [], error: null });

    renderHook(() => useWeightRecords());

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("weight_records");
      expect(mockSelect).toHaveBeenCalledWith("*");
    });
  });

  it("エラー発生時にerrorをセットする", async () => {
    mockFrom({ data: null, error: { message: "テーブルが存在しません" } });

    const { result } = renderHook(() => useWeightRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("テーブルが存在しません");
  });

  it("空データの場合records=[]でloading=falseになる", async () => {
    mockFrom({ data: [], error: null });

    const { result } = renderHook(() => useWeightRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
