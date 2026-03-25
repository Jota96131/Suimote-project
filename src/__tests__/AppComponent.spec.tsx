import App from "../App";
import { render, screen } from "@testing-library/react";
import { supabase } from "../supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  mockSupabase.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  } as any);
});

describe("App", () => {
  it("タイトル「Suimote」を表示する", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
