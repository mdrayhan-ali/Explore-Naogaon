export type LabelInput = { id: string; x: number; y: number; text: string; priority: number }
export type PlacedLabel = { id: string; x: number; y: number; anchor: 'start' | 'end' | 'middle'; width: number }

type Box = { left: number; top: number; right: number; bottom: number }
const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

/** Rough text width: Bengali and Latin letters are both close to half the font size wide. */
export function estimateWidth(text: string, fontSize: number): number {
  return [...text].length * fontSize * 0.56
}

/**
 * Puts each label beside its dot (right, left, above, then below), keeping labels from
 * covering each other, the dots, or the edge of the map. A label that cannot fit anywhere
 * is left out, so the map stays readable; the dot is still drawn by the caller.
 */
export function layoutLabels(
  items: LabelInput[],
  { fontSize, dotRadius, width, height }: { fontSize: number; dotRadius: number; width: number; height: number },
): Map<string, PlacedLabel> {
  const placed = new Map<string, PlacedLabel>()
  const taken: Box[] = items.map((item) => ({
    left: item.x - dotRadius, right: item.x + dotRadius, top: item.y - dotRadius, bottom: item.y + dotRadius,
  }))
  const gap = dotRadius + 5
  const ordered = [...items].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))

  for (const item of ordered) {
    const w = estimateWidth(item.text, fontSize)
    const h = fontSize * 1.25
    const box = (left: number, top: number): Box => ({ left, right: left + w, top, bottom: top + h })
    const far = gap + h
    const candidates: { x: number; y: number; anchor: PlacedLabel['anchor']; box: Box }[] = [
      { x: item.x + gap, y: item.y + h * 0.3, anchor: 'start', box: box(item.x + gap, item.y - h / 2) },
      { x: item.x - gap, y: item.y + h * 0.3, anchor: 'end', box: box(item.x - gap - w, item.y - h / 2) },
      { x: item.x, y: item.y - gap - h * 0.15, anchor: 'middle', box: box(item.x - w / 2, item.y - gap - h) },
      { x: item.x, y: item.y + gap + h * 0.8, anchor: 'middle', box: box(item.x - w / 2, item.y + gap) },
      { x: item.x + gap, y: item.y - far * 0.5, anchor: 'start', box: box(item.x + gap, item.y - far * 0.5 - h * 0.8) },
      { x: item.x - gap, y: item.y - far * 0.5, anchor: 'end', box: box(item.x - gap - w, item.y - far * 0.5 - h * 0.8) },
      { x: item.x + gap, y: item.y + far * 0.5 + h * 0.8, anchor: 'start', box: box(item.x + gap, item.y + far * 0.5) },
      { x: item.x - gap, y: item.y + far * 0.5 + h * 0.8, anchor: 'end', box: box(item.x - gap - w, item.y + far * 0.5) },
      { x: item.x, y: item.y - far - h * 0.15, anchor: 'middle', box: box(item.x - w / 2, item.y - far - h) },
      { x: item.x, y: item.y + far + h * 0.8, anchor: 'middle', box: box(item.x - w / 2, item.y + far) },
    ]
    const choice = candidates.find((candidate) =>
      candidate.box.left >= 0 && candidate.box.right <= width && candidate.box.top >= 0 && candidate.box.bottom <= height &&
      !taken.some((box) => overlaps(box, candidate.box)))
    if (!choice) continue
    taken.push(choice.box)
    placed.set(item.id, { id: item.id, x: choice.x, y: choice.y, anchor: choice.anchor, width: w })
  }
  return placed
}
