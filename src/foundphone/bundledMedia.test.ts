import { expect, test } from "bun:test";
import { isImage, safeMedia } from "./schema";

test("bundled photos with Chinese file names are allowed", () => {
  const src = "./media/微信图片_20261029000319_6133_1039.jpg";
  expect(safeMedia(src)).toBe(src);
  expect(isImage(src)).toBe(true);
});

test("bundled media still rejects paths that leave the media folder", () => {
  expect(safeMedia("./media/../secret.jpg")).toBe("");
  expect(safeMedia("./media/a/b.jpg")).toBe("");
});
