import { renderHook, waitFor } from "@testing-library/react";
import { useMyStats } from "../hooks/useMyStats";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useMyStats", () => {
  it("累計記録を取得できる", async () => {
    const mockStats = { total_distance: 50000, total_count: 30 };
    mockSupabase.rpc.mockResolvedValue({ data: mockStats, error: null });

    const { result } = renderHook(() => useMyStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it("get_my_stats RPCをuser_idで呼び出す", async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: { total_distance: 0, total_count: 0 },
      error: null,
    });

    renderHook(() => useMyStats());

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_my_stats", {
        p_user_id: "user-1",
      });
    });
  });

  it("エラー発生時にerrorをセットする", async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: "RPC実行エラー" },
    });

    const { result } = renderHook(() => useMyStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("RPC実行エラー");
    expect(result.current.stats).toBeNull();
  });
});
