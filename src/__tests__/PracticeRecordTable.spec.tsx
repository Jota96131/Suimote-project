import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PracticeRecordTable from "../components/PracticeRecordTable";
import type { PracticeRecord } from "../types";

const mockRecords: PracticeRecord[] = [
  {
    id: "1",
    date: "2024-01-15",
    distance: 1000,
    time: "1230", // 秒数: 20分30秒 = 1230秒
    stroke: "クロール",
    facility: "市民プール",
    memo: null,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    date: "2024-01-10",
    distance: 500,
    time: "600", // 秒数: 10分0秒 = 600秒
    stroke: "平泳ぎ",
    facility: "スポーツセンター",
    memo: "フォーム意識",
    created_at: "2024-01-10T09:00:00Z",
  },
];

function renderWithRouter(records: PracticeRecord[]) {
  return render(
    <MemoryRouter>
      <PracticeRecordTable records={records} />
    </MemoryRouter>
  );
}

describe("PracticeRecordTable", () => {
  it("記録の件数分のカードを表示する", () => {
    renderWithRouter(mockRecords);
    expect(screen.getByText("クロール")).toBeInTheDocument();
    expect(screen.getByText("平泳ぎ")).toBeInTheDocument();
  });

  it("日付を正しく表示する", () => {
    renderWithRouter(mockRecords);
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("2024-01-10")).toBeInTheDocument();
  });

  it("距離を正しく表示する", () => {
    renderWithRouter(mockRecords);
    expect(screen.getByText("1000m")).toBeInTheDocument();
    expect(screen.getByText("500m")).toBeInTheDocument();
  });

  it("タイムをmm:ss形式に変換して表示する", () => {
    renderWithRouter(mockRecords);
    expect(screen.getByText("20:30.00")).toBeInTheDocument();
    expect(screen.getByText("10:00.00")).toBeInTheDocument();
  });

  it("泳法を正しく表示する", () => {
    renderWithRouter(mockRecords);
    expect(screen.getByText("クロール")).toBeInTheDocument();
    expect(screen.getByText("平泳ぎ")).toBeInTheDocument();
  });

  it("プール施設を正しく表示する", () => {
    renderWithRouter(mockRecords);
    expect(screen.getByText("市民プール")).toBeInTheDocument();
    expect(screen.getByText("スポーツセンター")).toBeInTheDocument();
  });

  it.each([
    ["クロール"],
    ["平泳ぎ"],
    ["背泳ぎ"],
    ["バタフライ"],
    ["個人メドレー"],
  ] as const)("泳法「%s」を正しく表示する", (stroke) => {
    const record: PracticeRecord = {
      id: "test",
      date: "2024-01-01",
      distance: 100,
      time: "60",
      stroke,
      facility: "テストプール",
      memo: null,
      created_at: "2024-01-01T00:00:00Z",
    };

    renderWithRouter([record]);
    expect(screen.getByText(stroke)).toBeInTheDocument();
  });

  it("カードにpointerカーソルが設定されている", () => {
    const { container } = renderWithRouter(mockRecords);
    const cards = container.querySelectorAll(".cursor-pointer");
    expect(cards).toHaveLength(2);
  });

  it("カードをクリックできる", async () => {
    const user = userEvent.setup();
    renderWithRouter(mockRecords);

    const card = screen.getByText("クロール").closest(".cursor-pointer");
    expect(card).not.toBeNull();
    await user.click(card!);
  });
});
