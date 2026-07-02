import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Circle,
  Users,
  Megaphone,
  Clock3,
  CheckCircle2,
  MonitorPlay,
  LogIn,
  LogOut,
  HelpCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { BACKEND_URL } from "./config.js";

function useClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function waitTime(joinedAt, now) {
  const s = Math.floor((now - joinedAt) / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}分${s % 60}秒` : `${s}秒`;
}

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
    .font-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    body { background: #14161B; margin: 0; }
    @keyframes tally-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    .tally-live { animation: tally-pulse 1.2s ease-in-out infinite; }
    @keyframes row-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
    .row-in { animation: row-in 0.3s ease-out; }
  `}</style>
);

function LoginScreen() {
  return (
    <div className="min-h-screen w-full bg-[#14161B] text-[#E8E6E1] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />
      <div className="text-center">
        <p className="font-display text-sm uppercase tracking-widest text-[#7A7F8A] mb-3">配信予約キュー</p>
        <h1 className="font-display text-2xl text-[#F5F3EE] mb-8">Twitchアカウントでログインしてください</h1>
        <a
          href={`${BACKEND_URL}/auth/twitch`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#F0A202] text-[#0D0F13] font-display uppercase tracking-wide hover:bg-[#FFB627] transition"
        >
          <LogIn className="w-4 h-4" /> Twitchでログインする
        </a>
      </div>
    </div>
  );
}

export default function HostApp() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [queue, setQueue] = useState([]);
  const [activity, setActivity] = useState([]);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);
  const now = useClock();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setMe(data))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!me) return;
    const socket = io(BACKEND_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setSocketReady(true));
    socket.on("disconnect", () => setSocketReady(false));
    socket.on("queue:state", (data) => setQueue(data.queue));
    socket.on("activity:new", (entry) => setActivity((a) => [entry, ...a].slice(0, 12)));

    return () => socket.disconnect();
  }, [me]);

  const callViewer = useCallback((entry) => {
    socketRef.current?.emit("viewer:call", { login: entry.login, displayName: entry.displayName });
  }, []);

  const logout = async () => {
    await fetch(`${BACKEND_URL}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.reload();
  };

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(me.overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#14161B] flex items-center justify-center">
        <GlobalStyle />
      </div>
    );
  }

  if (!me) return <LoginScreen />;

  return (
    <div className="min-h-screen w-full bg-[#14161B] text-[#E8E6E1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />

      {/* ── ヘッダー ── */}
      <div className="border-b border-[#2A2D35] bg-[#191B21] px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Circle className={`w-3 h-3 ${socketReady ? "text-[#3ED598] fill-[#3ED598] tally-live" : "text-[#5A5F6A] fill-[#5A5F6A]"}`} />
          <span className="font-display text-sm uppercase tracking-widest text-[#9CA1AC]">
            {socketReady ? `連携中 — #${me.login}` : "接続中..."}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#7A7F8A]">コマンド</span>
          <span className="font-mono text-[11px] px-2 py-1 rounded bg-[#2A2D35] text-[#D6D3CC]">!yoyaku ・ !予約</span>
          <span className="font-mono text-[11px] px-2 py-1 rounded bg-[#2A2D35] text-[#D6D3CC]">!torikeshi ・ !取り消し</span>
          <span className="font-mono text-[11px] px-2 py-1 rounded bg-[#2A2D35] text-[#D6D3CC]">!kakunin ・ !確認</span>
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded border border-[#3A3E48] text-[#9CA1AC] hover:border-[#5A5F6A] hover:text-[#E8E6E1] transition"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* ── オーバーレイURL案内 ── */}
      <div className="px-6 py-3 bg-[#1B1E24] border-b border-[#2A2D35] flex items-center gap-3 flex-wrap">
        <MonitorPlay className="w-4 h-4 text-[#7A7F8A] shrink-0" />
        <span className="text-xs text-[#7A7F8A] shrink-0">OBSブラウザソース用URL</span>
        <code className="font-mono text-xs text-[#D6D3CC] bg-[#14161B] px-2 py-1 rounded truncate flex-1 min-w-0">{me.overlayUrl}</code>
        <button onClick={copyOverlayUrl} className="text-xs px-2.5 py-1.5 rounded bg-[#2A2D35] text-[#D6D3CC] hover:bg-[#3A3E48] transition flex items-center gap-1 shrink-0">
          <Copy className="w-3.5 h-3.5" /> {copied ? "コピーしました" : "コピー"}
        </button>
        <a href={me.overlayUrl} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1.5 rounded bg-[#2A2D35] text-[#D6D3CC] hover:bg-[#3A3E48] transition flex items-center gap-1 shrink-0">
          <ExternalLink className="w-3.5 h-3.5" /> プレビュー
        </a>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4 lg:p-6">
        {/* ── 左：予約キュー ── */}
        <div className="col-span-12 lg:col-span-6 bg-[#191B21] border border-[#2A2D35] rounded-lg flex flex-col">
          <div className="px-5 py-3 border-b border-[#2A2D35] flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-[#9CA1AC]">予約キュー</h2>
            <div className="flex items-center gap-1.5 text-[#7A7F8A]">
              <Users className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">{queue.length}人待ち</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2A2D35]" style={{ minHeight: 320 }}>
            {queue.length === 0 && (
              <div className="p-8 text-center text-sm text-[#5A5F6A]">
                まだ予約がありません。チャットで <span className="font-mono text-[#7A7F8A]">!yoyaku</span> と入力すると並べます
              </div>
            )}
            {queue.map((entry, i) => (
              <div key={entry.login} className="row-in px-4 py-3 flex items-center gap-3">
                <span className="font-mono text-xs text-[#5A5F6A] w-6">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#D6D3CC] truncate">{entry.displayName}</p>
                  <p className="font-mono text-[11px] text-[#5A5F6A] flex items-center gap-1">
                    <Clock3 className="w-3 h-3" /> {waitTime(entry.joinedAt, now)} 待ち
                  </p>
                </div>
                <button
                  onClick={() => callViewer(entry)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-[#F0A202] text-[#0D0F13] font-display uppercase tracking-wide hover:bg-[#FFB627] transition shrink-0"
                >
                  <Megaphone className="w-3.5 h-3.5" /> 呼び出す
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 右：アクティビティログ ── */}
        <div className="col-span-12 lg:col-span-6 bg-[#191B21] border border-[#2A2D35] rounded-lg flex flex-col">
          <div className="px-5 py-3 border-b border-[#2A2D35]">
            <h2 className="font-display text-sm uppercase tracking-widest text-[#9CA1AC]">アクティビティログ</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#2A2D35]" style={{ minHeight: 320 }}>
            {activity.length === 0 && <div className="p-6 text-center text-sm text-[#5A5F6A]">まだ動きがありません</div>}
            {activity.map((a) => {
              const meta = {
                joined: { icon: LogIn, color: "text-[#7DA6FF]", label: "予約" },
                cancelled: { icon: LogOut, color: "text-[#E85D5D]", label: "取消" },
                checked: { icon: HelpCircle, color: "text-[#9CA1AC]", label: "確認" },
                called: { icon: Megaphone, color: "text-[#F0A202]", label: "呼出" },
              }[a.type];
              const Icon = meta.icon;
              return (
                <div key={a.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                  <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />
                  <span className={`font-mono text-[10px] uppercase tracking-wide shrink-0 ${meta.color}`}>{meta.label}</span>
                  <span className="text-[#D6D3CC] truncate flex-1">{a.username}</span>
                  <span className="text-[11px] text-[#5A5F6A] hidden sm:inline">{a.detail}</span>
                  <span className="font-mono text-[11px] text-[#5A5F6A] shrink-0">
                    {new Date(a.time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
