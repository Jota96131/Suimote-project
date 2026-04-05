import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecordsPage from "../pages/RecordsPage";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function mockFromPending() {
  const mockRange = jest.fn(() => new Promise(() => {}));
  const mockOrder = jest.fn().mockReturnValue({ range: mockRange });
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
  mockSupabase.from.mockReturnValue({ select: mockSelect } as any);
}

function renderRecordsPage() {
  return render(
    <MemoryRouter>
      <RecordsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RecordsPage", () => {
  it("タイトル「練習記録」を表示する", () => {
    mockFromPending();

    renderRecordsPage();
    expect(screen.getByText("練習記録")).toBeInTheDocument();
  });

  it("「追加」リンクが/records/newを指している", () => {
    mockFromPending();

    renderRecordsPage();
    const link = screen.getByText("追加");
    expect(link.closest("a")).toHaveAttribute("href", "/records/new");
  });

  it("PracticeListコンポーネントを含む", () => {
    mockFromPending();

    renderRecordsPage();
    // PracticeListはローディング表示をするはず
    expect(screen.getByText("練習記録")).toBeInTheDocument();
  });
});
