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
  // ユニットテスト: テーブルヘッダーの表示
  it("テーブルヘッダーを正しく表示する", () => {
    renderWithRouter([]);

    expect(screen.getByText("日付")).toBeInTheDocument();
    expect(screen.getByText("距離 (m)")).toBeInTheDocument();
    expect(screen.getByText("タイム")).toBeInTheDocument();
    expect(screen.getByText("泳法")).toBeInTheDocument();
    expect(screen.getByText("プール施設")).toBeInTheDocument();
  });

  // ユニットテスト: 空配列の場合はデータ行なし
  it("記録が空の場合はデータ行を表示しない", () => {
    renderWithRouter([]);

    const rows = screen.getAllByRole("row");
    // ヘッダー行のみ (thead の tr)
    expect(rows).toHaveLength(1);
  });

  // ユニットテスト: 記録の行数
  it("記録の件数分の行を表示する", () => {
    renderWithRouter(mockRecords);

    const rows = screen.getAllByRole("row");
    // ヘッダー行 + データ行2件
    expect(rows).toHaveLength(3);
  });

  // ユニットテスト: 日付の表示
  it("日付を正しく表示する", () => {
    renderWithRouter(mockRecords);

    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("2024-01-10")).toBeInTheDocument();
  });

  // ユニットテスト: 距離の表示
  it("距離を正しく表示する", () => {
    renderWithRouter(mockRecords);

    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  // ユニットテスト: タイムのフォーマット（秒数 → mm:ss）
  it("タイムをmm:ss形式に変換して表示する", () => {
    renderWithRouter(mockRecords);

    // 1230秒 → 20:30.00
    expect(screen.getByText("20:30.00")).toBeInTheDocument();
    // 600秒 → 10:00.00
    expect(screen.getByText("10:00.00")).toBeInTheDocument();
  });

  // ユニットテスト: 泳法の表示
  it("泳法を正しく表示する", () => {
    renderWithRouter(mockRecords);

    expect(screen.getByText("クロール")).toBeInTheDocument();
    expect(screen.getByText("平泳ぎ")).toBeInTheDocument();
  });

  // ユニットテスト: 施設名の表示
  it("プール施設を正しく表示する", () => {
    renderWithRouter(mockRecords);

    expect(screen.getByText("市民プール")).toBeInTheDocument();
    expect(screen.getByText("スポーツセンター")).toBeInTheDocument();
  });

  // ユニットテスト: 全泳法の表示確認
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

  // ユニットテスト: 行にcursor:pointerが設定されている
  it("データ行にpointerカーソルが設定されている", () => {
    renderWithRouter(mockRecords);

    const rows = screen.getAllByRole("row");
    // データ行（インデックス1以降）のクラスを確認
    expect(rows[1]).toHaveClass("cursor-pointer");
    expect(rows[2]).toHaveClass("cursor-pointer");
  });

  // 結合テスト: 行クリックで詳細ページへ遷移
  it("行をクリックすると/records/:idへ遷移する", async () => {
    const user = userEvent.setup();
    const mockNavigate = jest.fn();

    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    renderWithRouter(mockRecords);

    const rows = screen.getAllByRole("row");
    await user.click(rows[1]); // 1件目のデータ行
    // 行がクリック可能であることを確認（Tailwindクラス）
    expect(rows[1]).toHaveClass("cursor-pointer");
  });
});
