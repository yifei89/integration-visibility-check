import { describe, expect, it } from "vitest";
import { beijingNow } from "./realtime";

describe("beijingNow", () => {
  it("UTC 16:30 对应北京时间次日 00:30（跨日）", () => {
    expect(beijingNow(new Date("2026-01-01T16:30:00Z"))).toEqual({
      date: "2026-01-02",
      time: "00:30",
    });
  });

  it("UTC 08:00 对应北京时间同日 16:00", () => {
    expect(beijingNow(new Date("2026-06-15T08:00:00Z"))).toEqual({
      date: "2026-06-15",
      time: "16:00",
    });
  });

  it("结果不受运行环境本地时区影响", () => {
    const a = beijingNow(new Date("2026-03-08T15:59:00Z"));
    const b = beijingNow(new Date("2026-03-08T15:59:00Z"));
    expect(a).toEqual(b);
    expect(a.time).toBe("23:59");
  });
});
