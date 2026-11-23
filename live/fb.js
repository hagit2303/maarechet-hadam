// שכבת הנתונים של המשחק החי: Firebase Realtime Database, או מצב הדגמה מקומי (?demo=1) לבדיקות.
import { FIREBASE_CONFIG } from "./firebase-config.js";

const DEMO = new URLSearchParams(location.search).has("demo");

export function isConfigured() {
  return DEMO || (FIREBASE_CONFIG && FIREBASE_CONFIG.databaseURL && !FIREBASE_CONFIG.databaseURL.includes("REPLACE"));
}

export async function connect() {
  return DEMO ? demoConnect() : firebaseConnect();
}

async function firebaseConnect() {
  const V = "10.12.2";
  const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const A = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
  const D = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = A.getAuth(app);
  await A.signInAnonymously(auth);
  const db = D.getDatabase(app);
  return {
    uid: auth.currentUser.uid,
    stamp: () => D.serverTimestamp(),
    set: (p, v) => D.set(D.ref(db, p), v),
    update: (p, v) => D.update(D.ref(db, p), v),
    get: async (p) => (await D.get(D.ref(db, p))).val(),
    on: (p, cb) => D.onValue(D.ref(db, p), (s) => cb(s.val())),
  };
}

// מצב הדגמה: כל הנתונים ב-localStorage של הדפדפן, וכל לשונית היא משתמש נפרד.
function demoConnect() {
  const K = "live-demo-db";
  const read = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch { return {}; } };
  const parts = (p) => p.split("/").filter(Boolean);
  const getP = (tree, p) => parts(p).reduce((o, k) => (o == null ? null : o[k] ?? null), tree);
  const listeners = new Set();
  const notify = () => { const t = read(); listeners.forEach((l) => l.cb(getP(t, l.p))); };
  addEventListener("storage", (e) => { if (e.key === K) notify(); });
  const write = (p, fn) => {
    const t = read(); const ks = parts(p); let o = t;
    ks.slice(0, -1).forEach((k) => { o[k] = o[k] && typeof o[k] === "object" ? o[k] : {}; o = o[k]; });
    fn(o, ks[ks.length - 1]);
    localStorage.setItem(K, JSON.stringify(t)); notify();
  };
  let uid = sessionStorage.getItem("demo-uid");
  if (!uid) { uid = "u" + Math.random().toString(36).slice(2, 9); sessionStorage.setItem("demo-uid", uid); }
  return {
    uid,
    stamp: () => Date.now(),
    set: async (p, v) => write(p, (o, k) => { if (v === null) delete o[k]; else o[k] = v; }),
    update: async (p, v) => write(p + "/_", (o) => { delete o._; Object.assign(o, v); }),
    get: async (p) => getP(read(), p),
    on: (p, cb) => { const l = { p, cb }; listeners.add(l); setTimeout(() => cb(getP(read(), p))); return () => listeners.delete(l); },
  };
}
