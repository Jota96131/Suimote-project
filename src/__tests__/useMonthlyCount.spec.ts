import { renderHook, waitFor } from "@testing-library/react";
import { useMonthlyCount } from "../hooks/useMonthlyCount";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useMonthlyCount", () => {
  it("今月の練習回数を取得できる", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: 5, error: null, count: null, status: 200, statusText: "OK" } as any);

    const { result } = renderHook(() => useMonthlyCount("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBe(5);
  });

  it("get_monthly_practice_count RPCをtarget_user_idで呼び出す", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: 0, error: null, count: null, status: 200, statusText: "OK" } as any);

    renderHook(() => useMonthlyCount("user-1"));

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_monthly_practice_count", {
        target_user_id: "user-1",
      });
    });
  });

  it("dataがnullのとき0を返す", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null, count: null, status: 200, statusText: "OK" } as any);

    const { result } = renderHook(() => useMonthlyCount("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBe(0);
  });

  it("userIdがundefinedのときRPCを呼ばない", () => {
    renderHook(() => useMonthlyCount(undefined));

    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });
});
