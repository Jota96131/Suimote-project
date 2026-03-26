import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditRecordPage from "../pages/EditRecordPage";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockRecord = {
  id: "abc-123",
  date: "2024-01-15",
  distance: 1000,
  time: "1230",
  stroke: "クロール",
  facility: "市民プール",
  memo: "調子良かった",
  created_at: "2024-01-15T10:00:00Z",
};

function renderEditPage(id = "abc-123") {
  return render(
    <MemoryRouter initialEntries={[`/records/${id}/edit`]}>
      <Routes>
        <Route path="/records/:id/edit" element={<EditRecordPage />} />
        <Route path="/records/:id" element={<div>詳細ページ</div>} />
        <Route path="/records" element={<div>一覧ページ</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EditRecordPage", () => {
  it("読み込み中に「読み込み中...」を表示する", () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn(() => new Promise(() => {})),
        }),
      }),
    } as any);

    renderEditPage();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("記録が見つからない場合にエラーメッセージを表示する", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as any);

    renderEditPage();

    await waitFor(() => {
      expect(screen.getByText("記録が見つかりません")).toBeInTheDocument();
    });
  });

  it("記録取得成功後にフォームに値がセットされる", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    } as any);

    renderEditPage();

    await waitFor(() => {
      expect(screen.getByText("練習記録を編集")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("距離 (m)")).toHaveValue(1000);
    expect(screen.getByLabelText("タイム (秒)（任意）")).toHaveValue(1230);
    expect(screen.getByLabelText("施設名（任意）")).toHaveValue("市民プール");
  });

  it("「詳細に戻る」リンクが正しいURLを指している", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    } as any);

    renderEditPage();

    await waitFor(() => {
      expect(screen.getByText("詳細に戻る")).toBeInTheDocument();
    });

    expect(screen.getByText("詳細に戻る").closest("a")).toHaveAttribute("href", "/records/abc-123");
  });

  it("更新ボタンが表示される", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    } as any);

    renderEditPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "更新する" })).toBeInTheDocument();
    });
  });

  it("更新成功時に詳細ページに遷移する", async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "practice_records") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
            }),
          }),
          update: mockUpdate,
        } as any;
      }
      return {} as any;
    });

    renderEditPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "更新する" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "更新する" }));

    await waitFor(() => {
      expect(screen.getByText("詳細ページ")).toBeInTheDocument();
    });
  });
});
