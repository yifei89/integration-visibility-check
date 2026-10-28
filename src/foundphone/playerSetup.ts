import type { Work } from "./schema";

const setupMarker = "player_setup_v1";
export function applyPlayerSetup(work: Work): boolean {
  if (work.variables[setupMarker]) return false;
  work.phone.passcode = "0412";
  work.variables.playerNameRequired = true;
  work.variables[setupMarker] = true;
  return true;
}

export function personalizeWork(work: Work, input: string): Work {
  const name = input.trim();
  if (!name) throw Error("请输入你的名字");
  const next = structuredClone(work);
  next.phone.owner = name;
  next.variables.playerName = name;
  for (const item of next.data.contacts ?? []) {
    if (item.title === "我") item.sender = name;
  }
  return next;
}