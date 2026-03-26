import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthPage from "../pages/AuthPage";

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
  }),
}));

function renderAuthPage() {
  return render(
    <MemoryRouter initialEntries={["/auth"]}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/records" element={<div>記録ページ</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthPage", () => {
  it("初期状態でログインフォームを表示する", () => {
    renderAuthPage();
    expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
  });

  it("モード切替でアカウント作成フォームに切り替わる", async () => {
    renderAuthPage();
    await userEvent.click(screen.getByText("アカウントをお持ちでない方はこちら"));
    expect(screen.getByText("アカウント作成")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登録する" })).toBeInTheDocument();
  });

  it("ログイン成功時に/recordsに遷移する", async () => {
    mockSignIn.mockResolvedValue(null);
    renderAuthPage();

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByText("記録ページ")).toBeInTheDocument();
    });
    expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("ログイン失敗時にエラーメッセージを表示する", async () => {
    mockSignIn.mockResolvedValue({ message: "認証に失敗しました" });
    renderAuthPage();

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(screen.getByText("認証に失敗しました")).toBeInTheDocument();
    });
  });

  it("新規登録時にsignUpを呼び出す", async () => {
    mockSignUp.mockResolvedValue(null);
    renderAuthPage();

    await userEvent.click(screen.getByText("アカウントをお持ちでない方はこちら"));
    await userEvent.type(screen.getByLabelText("メールアドレス"), "new@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith("new@example.com", "password123");
    });
  });

  it("処理中はボタンが「処理中...」になり無効化される", async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {})); // 永遠にpending
    renderAuthPage();

    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "処理中..." });
      expect(button).toBeDisabled();
    });
  });
});
