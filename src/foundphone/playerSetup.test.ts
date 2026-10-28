import { importExoManager } from "./exoManager";
import { describe, expect, it } from "vitest";
import { createEmptyWork } from "./demo";
import { applyPlayerSetup, personalizeWork } from "./playerSetup";

describe("player setup", () => {
  it("sets the manager identity to female", () => {
    const work = createEmptyWork();
    applyPlayerSetup(work);
    expect(work.variables.playerGender).toBe("female");
    expect(personalizeWork(work, "朱妍").variables.playerGender).toBe("female");
  });
  it("sets the lockscreen passcode to 0412 once", () => {
    const work = createEmptyWork();
    expect(applyPlayerSetup(work)).toBe(true);
    expect(work.phone.passcode).toBe("0412");
    work.phone.passcode = "1234";
    expect(applyPlayerSetup(work)).toBe(false);
    expect(work.phone.passcode).toBe("1234");
  });
  it("requires a player name and applies the chosen name without changing the story", () => {
    const work = createEmptyWork();
    applyPlayerSetup(work);
    expect(work.variables.playerNameRequired).toBe(true);
    expect(() => personalizeWork(work, "  ")).toThrow();
    const result = personalizeWork(work, "  朱妍  ");
    expect(result.phone.owner).toBe("朱妍");
    expect(result.variables.playerName).toBe("朱妍");
    expect(result.phone.passcode).toBe("0412");
    expect(result.data).toEqual(work.data);
    expect(work.variables.playerName).toBeUndefined();
  });
  it("shows the player's name wherever an app refers to the owner", () => {
    const work = createEmptyWork();
    importExoManager(work);
    const result = personalizeWork(work, "朱妍");
    expect(result.data.settings.find((i) => i.title === "朱妍")).toBeDefined();
    expect(result.data.find.find((i) => i.title === "朱妍的 iPhone")).toBeDefined();
    expect(Object.values(result.data).flat().some((i) => !i.outgoing && i.sender === "我")).toBe(false);
  });
});