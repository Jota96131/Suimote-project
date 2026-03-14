import { renderHook, act } from "@testing-library/react";
import { useAddRecord } from "../hooks/useAddRecord";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user-id" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useAddRecord", () => {
  // 初期状態
  it("初期状態でフォームが空でloading=false, error=nullを返す", () => {
    const { result } = renderHook(() => useAddRecord());

    expect(result.current.form.date).toBe("");
    expect(result.current.form.distance).toBe("");
    expect(result.current.form.time).toBe("");
    expect(result.current.form.stroke).toBe("クロール");
    expect(result.current.form.facility).toBe("");
    expect(result.current.form.memo).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // handleChange: input
  it("handleChangeでinputの値がformに反映される", () => {
    const { result } = renderHook(() => useAddRecord());

    act(() => {
      result.current.handleChange({
        target: { name: "date", value: "2024-03-01" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.form.date).toBe("2024-03-01");
  });

  // handleChange: select
  it("handleChangeでselectの値がformに反映される", () => {
    const { result } = renderHook(() => useAddRecord());

    act(() => {
      result.current.handleChange({
        target: { name: "stroke", value: "平泳ぎ" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.form.stroke).toBe("平泳ぎ");
  });

  // 登録成功
  it("handleSubmit成功時にonSuccessが呼ばれフォームがリセットされる", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    } as any);

    const { result } = renderHook(() => useAddRecord());

    act(() => {
      result.current.handleChange({
        target: { name: "date", value: "2024-03-01" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const onSuccess = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(onSuccess);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.form.date).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // 登録失敗
  it("handleSubmit失敗時にerrorにメッセージがセットされonSuccessは呼ばれない", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({
        error: { message: "INSERT失敗" },
      }),
    } as any);

    const { result } = renderHook(() => useAddRecord());
    const onSuccess = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(onSuccess);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.error).toBe("INSERT失敗");
    expect(result.current.loading).toBe(false);
  });

  // Supabaseクエリの検証
  it("practice_recordsテーブルに正しい値でINSERTする", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({ insert: mockInsert } as any);

    const { result } = renderHook(() => useAddRecord());

    act(() => {
      ["date:2024-03-01", "distance:1000", "time:3600", "facility:市民プール", "memo:テストメモ"].forEach(
        (entry) => {
          const [name, value] = entry.split(":");
          result.current.handleChange({
            target: { name, value },
          } as React.ChangeEvent<HTMLInputElement>);
        }
      );
    });

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("practice_records");
    expect(mockInsert).toHaveBeenCalledWith({
      date: "2024-03-01",
      distance: 1000,
      time: "3600",
      stroke: "クロール",
      facility: "市民プール",
      memo: "テストメモ",
      user_id: "test-user-id",
    });
  });

  // memoが空の場合はnullで送る
  it("memoが空文字の場合はnullでINSERTする", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({ insert: mockInsert } as any);

    const { result } = renderHook(() => useAddRecord());

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ memo: null })
    );
  });
});
