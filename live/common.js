// פונקציות משותפות ללוח ולדף התלמיד
export const LETTERS = ["א", "ב", "ג", "ד"];
export const $ = (s, r = document) => r.querySelector(s);
export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  kids.flat().forEach((k) => k != null && e.append(k.nodeType ? k : document.createTextNode(k)));
  return e;
}

// גוף השאלה בדיוק כמו במבחן: נוסח, טבלה או איור, והמשך הנוסח
export function questionBody(q) {
  const box = el("div", {});
  box.append(el("span", { class: "qnum" }, `שאלה ${q.n} מתוך 20`));
  box.append(el("p", { class: "qtext" }, q.q));
  if (q.table) {
    const t = el("table", { class: "qt" });
    q.table.forEach((r) => t.append(el("tr", {}, r.map((c) => el("td", {}, c)))));
    box.append(t);
  }
  if (q.img) box.append(el("img", { class: "qimg", src: q.img, alt: q.alt || "" }));
  if (q.q2) box.append(el("p", { class: "qtext" }, q.q2));
  return box;
}

export async function decryptKey(code) {
  const b = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const { salt, iv, ct } = window.KEY_ENC;
  const c = crypto.subtle;
  const base = await c.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  const key = await c.deriveKey({ name: "PBKDF2", salt: b(salt), iterations: 150000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const pt = await c.decrypt({ name: "AES-GCM", iv: b(iv) }, key, b(ct));
  return JSON.parse(new TextDecoder().decode(pt));
}

export const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
