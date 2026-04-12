import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WeightPage from "../pages/WeightPage";
import { supabase } from "../supabase";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function mockFromPending() {
  const mockLimit = jest.fn(() => new Promise(() => {}));
  const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
}

function mockFromEmpty() {
  const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });
  const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
}

function renderWeightPage() {
  return render(
    <MemoryRouter>
      <WeightPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("WeightPage", () => {
  it("タイトル「体重記録」を表示する", () => {
    mockFromPending();
    renderWeightPage();
    expect(screen.getByText("体重記録")).toBeInTheDocument();
  });

  it("体重入力フィールドを表示する", () => {
    mockFromPending();
    renderWeightPage();
    expect(screen.getByLabelText("体重 (kg)")).toBeInTheDocument();
  });

  it("「記録する」ボタンを表示する", () => {
    mockFromPending();
    renderWeightPage();
    expect(screen.getByText("記録する")).toBeInTheDocument();
  });

  it("記録がない場合「まだ記録がありません」と表示する", async () => {
    mockFromEmpty();
    renderWeightPage();
    expect(await screen.findByText("まだ記録がありません")).toBeInTheDocument();
  });
});
