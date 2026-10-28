import { useEffect, useState } from "react";

/** 固定使用中国标准时间（Asia/Shanghai，UTC+8），与设备本地时区无关。 */
const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function beijingNow(at: Date = new Date()): {
  date: string;
  time: string;
} {
  return {
    date: dateFmt.format(at),
    time: timeFmt.format(at),
  };
}

/**
 * 跟随真实时间的时钟：enabled 时每 10 秒刷新一次北京时间，
 * 关闭时返回 null，由调用方回退到作品里的虚拟时间。
 */
export function useRealClock(
  enabled: boolean,
): { date: string; time: string } | null {
  const [now, setNow] = useState(() => (enabled ? beijingNow() : null));
  useEffect(() => {
    if (!enabled) {
      setNow(null);
      return;
    }
    setNow(beijingNow());
    const id = window.setInterval(() => setNow(beijingNow()), 10_000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}
