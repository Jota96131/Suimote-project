import { renderHook, act } from "@testing-library/react";
import { useDeleteRecord } from "../hooks/useDeleteRecord";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useDeleteRecord", () => {
  // 初期状態
  it("初期状態でloading=false, error=nullを返す", () => {
    const { result } = renderHook(() => useDeleteRecord());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // 削除成功
  it("削除成功時にonSuccessが呼ばれる", async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ delete: mockDelete } as any);

    const { result } = renderHook(() => useDeleteRecord());
    const onSuccess = jest.fn();

    await act(async () => {
      await result.current.deleteRecord("abc-123", onSuccess);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "abc-123");
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // 削除失敗
  it("削除失敗時にerrorにメッセージがセットされonSuccessは呼ばれない", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: { message: "DELETE失敗" },
    });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ delete: mockDelete } as any);

    const { result } = renderHook(() => useDeleteRecord());
    const onSuccess = jest.fn();

    await act(async () => {
      await result.current.deleteRecord("abc-123", onSuccess);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.error).toBe("DELETE失敗");
    expect(result.current.loading).toBe(false);
  });
});
