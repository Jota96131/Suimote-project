import { getBadge } from "../utils/badge";

describe("getBadge", () => {
  it("月間20回以上でプラチナスイマーを返す", () => {
    const badge = getBadge(20);
    expect(badge).not.toBeNull();
    expect(badge!.label).toBe("プラチナスイマー");
    expect(badge!.icon).toBe("🏆");
  });

  it("月間25回でもプラチナスイマーを返す", () => {
    const badge = getBadge(25);
    expect(badge!.label).toBe("プラチナスイマー");
  });

  it("月間10回以上20回未満でゴールドスイマーを返す", () => {
    const badge = getBadge(10);
    expect(badge).not.toBeNull();
    expect(badge!.label).toBe("ゴールドスイマー");
    expect(badge!.icon).toBe("🥇");
  });

  it("月間15回でもゴールドスイマーを返す", () => {
    const badge = getBadge(15);
    expect(badge!.label).toBe("ゴールドスイマー");
  });

  it("月間5回以上10回未満でシルバースイマーを返す", () => {
    const badge = getBadge(5);
    expect(badge).not.toBeNull();
    expect(badge!.label).toBe("シルバースイマー");
    expect(badge!.icon).toBe("🥈");
  });

  it("月間8回でもシルバースイマーを返す", () => {
    const badge = getBadge(8);
    expect(badge!.label).toBe("シルバースイマー");
  });

  it("月間5回未満はnullを返す", () => {
    expect(getBadge(4)).toBeNull();
    expect(getBadge(0)).toBeNull();
  });

  it("境界値: 4回はnull、5回はシルバー、9回はシルバー、10回はゴールド、19回はゴールド、20回はプラチナ", () => {
    expect(getBadge(4)).toBeNull();
    expect(getBadge(5)!.label).toBe("シルバースイマー");
    expect(getBadge(9)!.label).toBe("シルバースイマー");
    expect(getBadge(10)!.label).toBe("ゴールドスイマー");
    expect(getBadge(19)!.label).toBe("ゴールドスイマー");
    expect(getBadge(20)!.label).toBe("プラチナスイマー");
  });
});
