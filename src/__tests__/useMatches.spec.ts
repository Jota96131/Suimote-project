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
  it("get_matched_usersのRPCが呼ばれる", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    renderHook(() => useMatches());

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_matched_users");
    });
  });

  it("マッチしたユーザーごとに月間練習回数を取得する", async () => {
    const matchedProfiles = [
      {
        id: "profile-2",
        user_id: "user-2",
        nickname: "水泳太郎",
        avatar_url: null,
        bio: null,
        home_pool: "代々木プール",
        area_id: "area-1",
        matching_opt_in: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    // 1回目: get_matched_users, 2回目: get_monthly_practice_count
    mockSupabase.rpc.mockImplementation((name: string) => {
      if (name === "get_matched_users") {
        return Promise.resolve({ data: matchedProfiles, error: null });
      }
      if (name === "get_monthly_practice_count") {
        return Promise.resolve({ data: 12, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const { result } = renderHook(() => useMatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.matches).toHaveLength(1);
    expect(result.current.matches[0].nickname).toBe("水泳太郎");
    expect(result.current.matches[0].monthlyCount).toBe(12);
    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_monthly_practice_count", {
      target_user_id: "user-2",
    });
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
