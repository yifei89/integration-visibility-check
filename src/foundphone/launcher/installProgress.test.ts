import { afterEach, expect, it, vi } from "vitest";
import { runInstallProgress } from "./installProgress";

afterEach(() => vi.useRealTimers());

it("reports intermediate progress and installs only at 100 percent", () => {
  vi.useFakeTimers();
  const progress = vi.fn();
  const complete = vi.fn();
  runInstallProgress(progress, complete);
  expect(progress).toHaveBeenLastCalledWith(0);
  vi.advanceTimersByTime(1000);
  expect(progress).toHaveBeenLastCalledWith(50);
  expect(complete).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1000);
  expect(progress).toHaveBeenLastCalledWith(100);
  expect(complete).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1000);
  expect(complete).toHaveBeenCalledTimes(1);
});

it("cancels pending installation when the phone is closed", () => {
  vi.useFakeTimers();
  const complete = vi.fn();
  const cancel = runInstallProgress(vi.fn(), complete);
  vi.advanceTimersByTime(500);
  cancel();
  vi.advanceTimersByTime(3000);
  expect(complete).not.toHaveBeenCalled();
});