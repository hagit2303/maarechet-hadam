// שכבת הנתונים של המשחק החי.
// 1. Firebase Realtime Database, אם firebase-config.js מולא.
// 2. אחרת: ממסר MQTT ציבורי וחינמי. כל ההודעות מוצפנות במפתח שנגזר מקוד המשחק, ושם הערוץ הוא גיבוב של הקוד.
// 3. ?demo=1: מצב הדגמה מקומי בדפדפן אחד (לבדיקות).
import { FIREBASE_CONFIG } from "./firebase-config.js";

const params = new URLSearchParams(location.search);
const DEMO = params.has("demo");
const FB = !!(FIREBASE_CONFIG && FIREBASE_CONFIG.databaseURL && !FIREBASE_CONFIG.databaseURL.includes("REPLACE"));

export function isConfigured() { return true; }

export async function connect() {
  if (DEMO) return demoConnect();
  if (FB) return firebaseConnect();
  return mqttConnect();
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

// ---------- עץ נתונים מקומי משותף (MQTT ומצב הדגמה) ----------
const split = (p) => p.split("/").filter(Boolean);
// leaves: Map path -> value. בונה את הערך של נתיב מתוך העלים.
function readTree(leaves, p) {
  const ks = split(p);
  for (let i = ks.length; i > 0; i--) {
    const a = ks.slice(0, i).join("/");
    if (leaves.has(a)) {
      let v = leaves.get(a);
      for (const k of ks.slice(i)) v = v == null || typeof v !== "object" ? null : v[k] ?? null;
      if (i === ks.length && v && typeof v === "object") v = JSON.parse(JSON.stringify(v)); else if (i < ks.length) return v;
      return mergeKids(leaves, ks, v);
    }
  }
  return mergeKids(leaves, ks, null);
}
function mergeKids(leaves, ks, base) {
  const pre = ks.join("/") + "/";
  let out = base;
  for (const [path, v] of leaves) {
    if (!path.startsWith(pre) || v == null) continue;
    const rest = split(path.slice(pre.length));
    if (out == null || typeof out !== "object") out = {};
    let o = out;
    rest.slice(0, -1).forEach((k) => { o[k] = o[k] && typeof o[k] === "object" ? o[k] : {}; o = o[k]; });
    o[rest[rest.length - 1]] = v;
  }
  return out;
}
const related = (a, b) => a === b || a.startsWith(b + "/") || b.startsWith(a + "/");

function persistentId(storage, key) {
  let id = null;
  try { id = storage.getItem(key); } catch {}
  if (!id) { id = "u" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { storage.setItem(key, id); } catch {} }
  return id;
}

// ---------- MQTT ----------
const BROKERS = ["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"];
const ROOT = "bio-live-hadam/v1";

function loadMqtt() {
  if (window.mqtt) return Promise.resolve(window.mqtt);
  return new Promise((ok, bad) => {
    const s = document.createElement("script");
    s.src = new URL("./mqtt.min.js", import.meta.url).href;
    s.onload = () => ok(window.mqtt); s.onerror = bad;
    document.head.append(s);
  });
}
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = (u) => btoa(String.fromCharCode(...u));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const games = new Map(); // g -> {key, hash}
async function gameCtx(g) {
  if (games.has(g)) return games.get(g);
  const c = crypto.subtle;
  const h = Array.from(new Uint8Array(await c.digest("SHA-256", enc.encode("bio-live-topic:" + g)))).slice(0, 12).map((x) => x.toString(16).padStart(2, "0")).join("");
  const base = await c.importKey("raw", enc.encode("bio-live:" + g), "PBKDF2", false, ["deriveKey"]);
  const key = await c.deriveKey({ name: "PBKDF2", salt: enc.encode("bio-live-hadam-salt"), iterations: 120000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  const ctx = { key, h }; games.set(g, ctx); return ctx;
}

async function connectBroker(m) {
  for (const url of BROKERS) {
    try {
      const client = m.connect(url, { clean: true, reconnectPeriod: 2000, connectTimeout: 8000, clientId: "bl_" + Math.random().toString(16).slice(2, 12) });
      await new Promise((ok, bad) => {
        const t = setTimeout(() => bad(new Error("timeout")), 9000);
        client.once("connect", () => { clearTimeout(t); ok(); });
        client.once("error", (e) => { clearTimeout(t); bad(e); });
      });
      return client;
    } catch (e) { console.warn("broker failed", url, e); }
  }
  throw new Error("no broker");
}

async function mqttConnect() {
  const m = await loadMqtt();
  const client = await connectBroker(m);
  const tester = params.get("tester");
  const uid = persistentId(localStorage, "live-uid") + (tester ? "_" + tester : "");
  const leaves = new Map(), listeners = new Set(), subs = new Map(); // g -> Promise(ready)
  let chain = Promise.resolve();

  const notify = (path) => listeners.forEach((l) => { if (related(l.p, path)) l.cb(readTree(leaves, l.p)); });

  client.on("message", (topic, payload) => {
    chain = chain.then(async () => {
      const parts = topic.split("/"); // ROOT(2) / h / rest...
      const h = parts[2];
      const g = [...games.entries()].find(([, v]) => v.h === h)?.[0];
      if (!g) return;
      const path = ["games", g, ...parts.slice(3)].join("/");
      if (!payload || !payload.length) { leaves.delete(path); return notify(path); }
      try {
        const [iv, ct] = dec.decode(payload).split(":");
        const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, games.get(g).key, unb64(ct));
        leaves.set(path, JSON.parse(dec.decode(pt)));
        notify(path);
      } catch (e) { /* הודעה שאינה של המשחק */ }
    });
  });

  // נרשמים לכל הערוץ של המשחק, ומחכים רגע להודעות השמורות (retained)
  const ensure = (g) => {
    if (!subs.has(g)) subs.set(g, (async () => {
      const { h } = await gameCtx(g);
      await new Promise((ok, bad) => client.subscribe(`${ROOT}/${h}/#`, { qos: 1 }, (e) => (e ? bad(e) : ok())));
      await new Promise((r) => setTimeout(r, 1500));
      await chain;
    })());
    return subs.get(g);
  };
  const gOf = (p) => { const ks = split(p); if (ks[0] !== "games" || !ks[1]) throw new Error("bad path " + p); return ks[1]; };

  const publish = async (p, v) => {
    const g = gOf(p); await ensure(g);
    const { key, h } = await gameCtx(g);
    const rest = split(p).slice(2).join("/");
    let payload = "";
    if (v != null) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(v))));
      payload = b64(iv) + ":" + b64(ct);
    }
    if (v == null) leaves.delete(p); else leaves.set(p, v);
    notify(p);
    await new Promise((ok, bad) => client.publish(`${ROOT}/${h}/${rest}`, payload, { qos: 1, retain: true }, (e) => (e ? bad(e) : ok())));
  };

  return {
    uid,
    stamp: () => Date.now(),
    set: publish,
    update: async (p, v) => { for (const [k, x] of Object.entries(v)) await publish(p + "/" + k, x); },
    get: async (p) => { await ensure(gOf(p)); return readTree(leaves, p); },
    on: (p, cb) => {
      const l = { p, cb }; listeners.add(l);
      ensure(gOf(p)).then(() => listeners.has(l) && cb(readTree(leaves, p)));
      return () => listeners.delete(l);
    },
  };
}

// ---------- מצב הדגמה: הכל ב-localStorage, וכל לשונית היא משתמש נפרד ----------
function demoConnect() {
  const K = "live-demo-db";
  const load = () => { try { return new Map(Object.entries(JSON.parse(localStorage.getItem(K)) || {})); } catch { return new Map(); } };
  const listeners = new Set();
  const notifyAll = () => { const leaves = load(); listeners.forEach((l) => l.cb(readTree(leaves, l.p))); };
  addEventListener("storage", (e) => { if (e.key === K) notifyAll(); });
  const write = (p, v) => {
    const leaves = load();
    if (v == null) leaves.delete(p); else leaves.set(p, v);
    localStorage.setItem(K, JSON.stringify(Object.fromEntries(leaves))); notifyAll();
  };
  const uid = persistentId(sessionStorage, "demo-uid");
  return {
    uid,
    stamp: () => Date.now(),
    set: async (p, v) => write(p, v),
    update: async (p, v) => Object.entries(v).forEach(([k, x]) => write(p + "/" + k, x)),
    get: async (p) => readTree(load(), p),
    on: (p, cb) => { const l = { p, cb }; listeners.add(l); setTimeout(() => cb(readTree(load(), p))); return () => listeners.delete(l); },
  };
}
