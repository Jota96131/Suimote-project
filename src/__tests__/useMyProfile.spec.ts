import { renderHook, waitFor } from "@testing-library/react";
import { useMyProfile } from "../hooks/useMyProfile";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockProfile = {
  id: "profile-1",
  user_id: "user-1",
  nickname: "テスト太郎",
  avatar_url: null,
  bio: "水泳が好きです",
  home_pool: "渋谷区スポーツセンター",
  area_id: "area-1",
  created_at: "2024-01-01T00:00:00Z",
  areas: { id: "area-1", name: "渋谷・新宿" },
};

const mockAreas = [
  { id: "area-1", name: "渋谷・新宿" },
  { id: "area-2", name: "池袋・板橋" },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useMyProfile", () => {
  it("プロフィールとエリア一覧を取得できる", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        } as any;
      }
      // areas
      return {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockAreas, error: null }),
        }),
      } as any;
    });

    const { result } = renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.areas).toEqual(mockAreas);
    expect(result.current.error).toBeNull();
  });

  it("プロフィール取得エラー時にerrorをセットする", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "プロフィールが見つかりません" },
              }),
            }),
          }),
        } as any;
      }
      return {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockAreas, error: null }),
        }),
      } as any;
    });

    const { result } = renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("プロフィールが見つかりません");
    expect(result.current.profile).toBeNull();
  });

  it("profilesテーブルをuser_idで絞り込んでmaybeSingle取得する", async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
    const mockEq = jest.fn().mockReturnValue({ maybeSingle: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: mockSelect } as any;
      }
      return {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockAreas, error: null }),
        }),
      } as any;
    });

    renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSelect).toHaveBeenCalledWith("*, areas(id, name)");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockSingle).toHaveBeenCalled();
    });
  });
});
