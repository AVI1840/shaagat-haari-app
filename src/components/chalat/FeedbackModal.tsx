"use client";
import { useState, useEffect, useRef } from "react";

interface Props { open: boolean; onClose: () => void; }

const STORAGE_KEY = "btl-chalat-unemployment-feedback";
const APP_NAME = "כלי חל\"ת הוראת שעה";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwD8CMFoP5XoOwRLwK_OxMMOFKF8fS2CRpbJkNdOHjbnJIepkOLzlGrg3GQNGRqbwB6bA/exec";
const NAME_KEY = "btl-chalat-unemployment-feedback-user-name";

type Cat = "באג" | "שיפור" | "נתונים" | "עיצוב";
type Sev = "קריטי" | "שיפור" | "קטן";
interface Entry { id: number; name: string; cat: Cat | ""; sev: Sev | ""; text: string; ts: string; sent: boolean; }

async function send(e: Entry, page: string): Promise<boolean> {
  try {
    await fetch(SHEET_URL, { method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: APP_NAME, name: e.name || "אנונימי", category: e.cat || "כללי", severity: e.sev || "—", text: e.text, page })
    });
    return true;
  } catch { return false; }
}

export function FeedbackModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState<Cat | "">("");
  const [sev, setSev] = useState<Sev | "">("");
  const [text, setText] = useState("");
  const [items, setItems] = useState<Entry[]>([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"" | "ok" | "offline">("");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      setName(localStorage.getItem(NAME_KEY) || "");
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setItems(JSON.parse(s));
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const unsent = items.filter((i) => !i.sent);
    if (!unsent.length) return;
    Promise.all(unsent.map((i) => send(i, window.location.pathname))).then((r) => {
      save(items.map((item) => {
        const idx = unsent.findIndex((u) => u.id === item.id);
        return idx >= 0 && r[idx] ? { ...item, sent: true } : item;
      }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = (u: Entry[]) => { setItems(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); };

  const submit = async () => {
    if (!text.trim() || !name.trim()) return;
    localStorage.setItem(NAME_KEY, name.trim());
    setSending(true); setStatus("");
    const entry: Entry = { id: Date.now(), name: name.trim(), cat, sev, text: text.trim(), ts: new Date().toISOString(), sent: false };
    const ok = await send(entry, window.location.pathname);
    entry.sent = ok;
    save([entry, ...items]);
    setCat(""); setSev(""); setText("");
    setSending(false); setStatus(ok ? "ok" : "offline");
    setTimeout(() => setStatus(""), 3000);
  };

  const exportAll = () => {
    if (!items.length) return;
    const lines = items.map((fb) => `[${new Date(fb.ts).toLocaleString("he-IL")}] [${fb.name}] [${fb.cat || "—"}] [${fb.sev || "—"}] ${fb.text}`);
    navigator.clipboard.writeText(`משובי פיילוט — ${APP_NAME}\n${"=".repeat(50)}\n\n${lines.join("\n\n")}`);
  };

  if (!open) return null;

  const cats: Cat[] = ["באג", "שיפור", "נתונים", "עיצוב"];
  const sevs: Sev[] = ["קריטי", "שיפור", "קטן"];
  const sevCls = (s: Sev) => s === "קריטי" ? "border-red-500 bg-red-50 text-red-700" : s === "שיפור" ? "border-orange-400 bg-orange-50 text-orange-700" : "border-green-500 bg-green-50 text-green-700";

  return (
    <dialog ref={ref} onClose={onClose}
      className="fixed inset-0 z-[100] m-auto w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-black/10 shadow-xl bg-white p-0 backdrop:bg-black/40"
      dir="rtl">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <h2 className="text-lg font-bold text-[#0c3058]">משוב פיילוט</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="סגור">×</button>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">שם</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך"
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm text-right" dir="rtl" />
        </div>

        <div>
          <p className="text-sm font-medium mb-1">קטגוריה</p>
          <div className="flex gap-2 flex-wrap justify-end">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(cat === c ? "" : c)} type="button"
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${cat === c ? "border-[#1B3A5C] bg-[#1B3A5C] text-white" : "border-gray-300 bg-white text-gray-700 hover:border-[#1B3A5C]"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">חומרה</p>
          <div className="flex gap-2 flex-wrap justify-end">
            {sevs.map((s) => (
              <button key={s} onClick={() => setSev(sev === s ? "" : s)} type="button"
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${sev === s ? `${sevCls(s)} border-2` : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">תיאור</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="תאר את המשוב..."
            className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm text-right min-h-[80px] resize-y" dir="rtl" />
        </div>

        <button onClick={submit} disabled={!text.trim() || !name.trim() || sending} type="button"
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#1B3A5C" }}>
          {sending ? "שולח..." : "שלח משוב"}
        </button>
        {status === "ok" && <p className="text-xs text-green-600 text-center">נשלח בהצלחה</p>}
        {status === "offline" && <p className="text-xs text-orange-500 text-center">נשמר מקומית — יישלח כשיהיה חיבור</p>}

        {items.length > 0 && (
          <div className="border-t border-black/10 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={() => save([])} className="text-xs text-red-500 hover:underline cursor-pointer" type="button">מחק הכל</button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{items.length} משובים</span>
                <button onClick={exportAll} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer" type="button">ייצוא ללוח</button>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((fb) => (
                <div key={fb.id} className="bg-gray-50 rounded-lg p-3 text-right border border-gray-200">
                  <div className="flex items-center gap-2 mb-1 flex-wrap justify-end">
                    {fb.cat && <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] font-medium">{fb.cat}</span>}
                    {fb.sev && <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sevCls(fb.sev as Sev)}`}>{fb.sev}</span>}
                    {fb.sent ? <span className="text-xs text-green-600">✓</span> : <span className="text-xs text-orange-500">⏳</span>}
                    <span className="text-xs text-gray-400">{fb.name}</span>
                  </div>
                  <p className="text-sm text-gray-800">{fb.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
