import { renderHook, waitFor } from "@testing-library/react";
import { useAreaUsers } from "../hooks/useAreaUsers";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockProfile = {
  id: "profile-1",
  user_id: "user-1",
  nickname: "自分",
  avatar_url: null,
  bio: null,
  home_pool: null,
  area_id: "area-1",
  matching_opt_in: true,
  created_at: "2024-01-01T00:00:00Z",
  areas: { id: "area-1", name: "渋谷・新宿" },
};

const mockAreas = [{ id: "area-1", name: "渋谷・新宿" }];

jest.mock("../hooks/useMyProfile", () => ({
  useMyProfile: () => ({
    profile: mockProfile,
    areas: mockAreas,
    loading: false,
    error: null,
    updateProfile: jest.fn(),
  }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useAreaUsers", () => {
  it("get_area_users_with_stats RPCが正しい引数で呼ばれる", async () => {
    (mockSupabase.rpc as jest.Mock) = jest.fn().mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useAreaUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_area_users_with_stats", {
      p_area_id: "area-1",
      p_exclude_user_id: "user-1",
    });
  });
});
