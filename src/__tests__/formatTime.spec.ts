import { formatTime } from "../utils/formatTime";

describe("formatTime", () => {
  it("0秒を00:00.00に変換する", () => {
    expect(formatTime(0)).toBe("00:00.00");
  });

  it("整数秒を正しくフォーマットする", () => {
    expect(formatTime(60)).toBe("01:00.00");
  });

  it("秒数が60未満の場合は分が00になる", () => {
    expect(formatTime(30)).toBe("00:30.00");
  });

  it("小数点付きの秒数を正しくフォーマットする", () => {
    expect(formatTime(90.5)).toBe("01:30.50");
  });

  it("大きな値（1230秒 = 20分30秒）を正しく変換する", () => {
    expect(formatTime(1230)).toBe("20:30.00");
  });

  it("秒部分が1桁の場合0埋めされる", () => {
    expect(formatTime(5)).toBe("00:05.00");
  });

  it("小数点以下が1桁の場合0埋めされる", () => {
    expect(formatTime(61.1)).toBe("01:01.10");
  });
});
