import { renderHook, waitFor } from "@testing-library/react";
import { useMatches } from "../hooks/useMatches";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockSupabase = supabase as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useMatches", () => {
  it("get_matched_users_with_statsのRPCが呼ばれる", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    renderHook(() => useMatches());

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_matched_users_with_stats");
    });
  });

  it("マッチしたユーザーとmonthlyCountが返される", async () => {
    const matchedProfiles = [
      {
        user_id: "user-2",
        nickname: "水泳太郎",
        avatar_url: null,
        bio: null,
        home_pool: "代々木プール",
        area_id: "area-1",
        matching_opt_in: true,
        monthlyCount: 12,
      },
    ];

    mockSupabase.rpc.mockResolvedValue({ data: matchedProfiles, error: null });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.matches).toHaveLength(1);
    expect(result.current.matches[0].nickname).toBe("水泳太郎");
    expect(result.current.matches[0].monthlyCount).toBe(12);
  });

  it("RPCエラー時にerrorがセットされる", async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: "RPC失敗" },
    });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("RPC失敗");
    expect(result.current.matches).toHaveLength(0);
  });

  it("マッチが0件の場合空配列を返す", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.matches).toHaveLength(0);
  });
});
