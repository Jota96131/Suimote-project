import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe("HomePage", () => {
  it("ロゴ「Suimote」を表示する", () => {
    renderHomePage();
    expect(screen.getByText(/Sui/)).toBeInTheDocument();
    expect(screen.getByText("mote")).toBeInTheDocument();
  });

  it("キャッチコピー「泳いで、つながる。」を表示する", () => {
    renderHomePage();
    expect(screen.getByText("泳いで、つながる。")).toBeInTheDocument();
  });

  it("「はじめる」リンクが/authを指している", () => {
    renderHomePage();
    const link = screen.getByText("はじめる");
    expect(link.closest("a")).toHaveAttribute("href", "/auth");
  });

  it("「練習記録を見る」リンクが/recordsを指している", () => {
    renderHomePage();
    const link = screen.getByText("練習記録を見る");
    expect(link.closest("a")).toHaveAttribute("href", "/records");
  });

  it("特徴セクション（記録する・見つける・つながる）を表示する", () => {
    renderHomePage();
    expect(screen.getByText("記録する")).toBeInTheDocument();
    expect(screen.getByText("見つける")).toBeInTheDocument();
    expect(screen.getByText("つながる")).toBeInTheDocument();
  });
});
