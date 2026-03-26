import { resizeImage } from "../utils/resizeImage";

describe("resizeImage", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalImage = window.Image;

  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn().mockReturnValue("blob:mock-url");
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    window.Image = originalImage;
  });

  function mockImage(width: number, height: number) {
    window.Image = class MockImage {
      width = width;
      height = height;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    } as unknown as typeof Image;
  }

  function mockCanvas(blob: Blob | null, ctxAvailable = true) {
    const mockDrawImage = jest.fn();
    const mockToBlob = jest.fn((cb: BlobCallback) => cb(blob));
    const mockGetContext = jest.fn().mockReturnValue(
      ctxAvailable ? { drawImage: mockDrawImage } : null
    );

    jest.spyOn(document, "createElement").mockImplementation(
      (tag: string) => {
        if (tag === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: mockGetContext,
            toBlob: mockToBlob,
          } as unknown as HTMLCanvasElement;
        }
        return document.createElement(tag);
      }
    );

    return { mockDrawImage, mockToBlob, mockGetContext };
  }

  function createMockFile(name = "test.jpg") {
    return new File(["dummy"], name, { type: "image/jpeg" });
  }

  it("画像をリサイズしてFileを返す", async () => {
    mockImage(200, 200);
    mockCanvas(new Blob(["resized"], { type: "image/jpeg" }));

    const result = await resizeImage(createMockFile());
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe("test.jpg");
    expect(result.type).toBe("image/jpeg");
  });

  it("画像読み込み失敗時にエラーをthrowする", async () => {
    window.Image = class MockImage {
      width = 0;
      height = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    } as unknown as typeof Image;

    await expect(resizeImage(createMockFile())).rejects.toThrow("Failed to load image");
  });

  it("Canvas contextが取得できない場合にエラーをthrowする", async () => {
    mockImage(200, 200);
    mockCanvas(null, false);

    await expect(resizeImage(createMockFile())).rejects.toThrow("Canvas context not available");
  });

  it("Blob生成失敗時にエラーをthrowする", async () => {
    mockImage(200, 200);
    mockCanvas(null);

    await expect(resizeImage(createMockFile())).rejects.toThrow("Failed to create blob");
  });
});
