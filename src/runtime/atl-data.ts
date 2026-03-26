export const count = (list: unknown[]) => list.length;
export const countBy = (list: unknown[]) => {
  const map: Record<string, number> = {};
  for (const item of list) {
    const key = String(item);
    map[key] = (map[key] || 0) + 1;
  }
  return map;
};
export const first = (list: unknown[]) => list[0];
export const last = (list: unknown[]) => list[list.length - 1];
