// עזרים למשחק השאלות הפתוחות
import { el } from "../common.js";
export const Q = window.OPEN;
export const TOTAL = Q.reduce((s, q) => s + q.pts, 0);
export const label = (q) => `שאלה ${q.qn} · סעיף ${q.l}`;

// גוף הסעיף כמו במבחן: פתיח השאלה, האיור, ונוסח הסעיף
export function itemBody(q, i) {
  const box = el("div", { class: "ibody" });
  box.append(el("div", { class: "ihead" }, el("span", { class: "qnum" }, label(q)), el("span", { class: "pts" }, `${q.pts} נק'`), el("span", { class: "mut step" }, `סעיף ${i + 1} מתוך ${Q.length}`)));
  q.stem.forEach((p) => box.append(el("p", { class: "stem" }, p)));
  if (q.img) box.append(el("img", { class: "qimg", src: q.img, alt: q.alt || "" }));
  q.text.forEach((p) => box.append(el("p", { class: "qtext" }, p)));
  return box;
}

// ניקוד לפי הרכיבים שסומנו (עשיריות נקודה)
export function selfScore(q, comps, marks) {
  if (!comps || !marks) return 0;
  const pct = comps.reduce((s, c, j) => s + (marks[j] ? c.p : 0), 0);
  return Math.round(q.pts * pct) / 100;
}
