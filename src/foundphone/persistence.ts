import Dexie, { type Table } from "dexie";
import type { Work, Runtime } from "./schema";
import { applyPreinstalledApps } from "./apps";
class Database extends Dexie {
  works!: Table<Work, string>;
  saves!: Table<{ id: string; state: Runtime }, string>;
  constructor() {
    super("foundphone-studio");
    this.version(1).stores({ works: "id,updatedAt", saves: "id" });
    this.version(2).stores({ works: "id,updatedAt", saves: "id" }).upgrade(async (tx) => {
      await tx.table<Work>("works").toCollection().modify((w) => {
        applyPreinstalledApps(w);
      });
    });
  }
}
export const db = new Database();
