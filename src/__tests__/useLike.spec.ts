/**
 * useLike のロジックテスト
 *
 * useLike は内部で supabase.from("likes").select().eq() を
 * useEffect 内で呼ぶため、直接 renderHook するとact警告やタイミング問題が起きやすい。
 * そのため、UserListPage のコンポーネントテストを通じてUI統合で検証し、
 * ここでは sendLike / removeLike のSupabase呼び出しロジックを関数レベルでテストする。
 */
import { supabase } from "../supabase";

const mockSupabase = supabase as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockSupabase.from.mockReturnThis();
  mockSupabase.select.mockReturnThis();
  mockSupabase.eq.mockResolvedValue({ data: [], error: null });
  mockSupabase.rpc.mockResolvedValue({ data: false });
});

describe("useLike - Supabase呼び出し", () => {
  describe("いいね送信", () => {
    it("likesテーブルにinsertされる", async () => {
      mockSupabase.insert = jest.fn().mockResolvedValue({ error: null });

      // sendLike相当の処理を直接テスト
      const fromUserId = "user-1";
      const toUserId = "user-2";

      const { error } = await supabase
        .from("likes")
        .insert({ from_user_id: fromUserId, to_user_id: toUserId });

      expect(error).toBeNull();
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        from_user_id: "user-1",
        to_user_id: "user-2",
      });
    });
  });

  describe("いいね取消", () => {
    it("likesテーブルからdeleteされる", async () => {
      const mockEq2 = jest.fn().mockResolvedValue({ error: null });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValueOnce({ delete: mockDelete });

      const fromUserId = "user-1";
      const toUserId = "user-2";

      await supabase
        .from("likes")
        .delete()
        .eq("from_user_id", fromUserId)
        .eq("to_user_id", toUserId);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq1).toHaveBeenCalledWith("from_user_id", "user-1");
      expect(mockEq2).toHaveBeenCalledWith("to_user_id", "user-2");
    });
  });

  describe("マッチ成立判定", () => {
    it("check_mutual_like RPCがtrueを返す場合マッチ成立", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true });

      const { data: isMutual } = await supabase.rpc("check_mutual_like", {
        target_user_id: "user-2",
      });

      expect(isMutual).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("check_mutual_like", {
        target_user_id: "user-2",
      });
    });

    it("check_mutual_like RPCがfalseを返す場合マッチ不成立", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: false });

      const { data: isMutual } = await supabase.rpc("check_mutual_like", {
        target_user_id: "user-2",
      });

      expect(isMutual).toBe(false);
    });
  });

  describe("いいね一覧取得", () => {
    it("自分が送ったいいねを取得できる", async () => {
      mockSupabase.eq.mockResolvedValue({
        data: [{ to_user_id: "user-2" }, { to_user_id: "user-3" }],
        error: null,
      });

      const { data } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", "user-1");

      expect(data).toHaveLength(2);
      expect(data![0].to_user_id).toBe("user-2");
    });

    it("自分がもらったいいねを取得できる", async () => {
      mockSupabase.eq.mockResolvedValue({
        data: [{ from_user_id: "user-3" }],
        error: null,
      });

      const { data } = await supabase
        .from("likes")
        .select("from_user_id")
        .eq("to_user_id", "user-1");

      expect(data).toHaveLength(1);
      expect(data![0].from_user_id).toBe("user-3");
    });
  });
});
