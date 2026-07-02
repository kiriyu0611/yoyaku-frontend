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
    <div className="min-h-screen w-full bg-[#14161B] text-[#E8E6E1] flex items-center justify-center px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />
      <div className="max-w-lg w-full text-center">
        <p className="font-display text-sm uppercase tracking-widest text-[#7A7F8A] mb-3">配信予約キュー</p>
        <h1 className="font-display text-2xl text-[#F5F3EE] mb-4">Twitchアカウントでログインしてください</h1>
        <p className="text-sm text-[#9CA1AC] leading-relaxed mb-8">
          視聴者をチャットのコマンドで順番待ちに並ばせて、配信内で1人ずつ呼び出せるツールです。
          <br />
          ログインすると、あなた専用の予約キューとOBS用URLが自動で発行されます。
        </p>

        
          href={`${BACKEND_URL}/auth/twitch`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#F0A202] text-[#0D0F13] font-display uppercase tracking-wide hover:bg-[#FFB627] transition mb-10"
        >
          <LogIn className="w-4 h-4" /> Twitchでログインする
        </a>

        <div className="bg-[#191B21] border border-[#2A2D35] rounded-lg p-5 text-left">
          <p className="font-display text-xs uppercase tracking-widest text-[#7A7F8A] mb-3">視聴者が使えるコマンド</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs px-2 py-1 rounded bg-[#2A2D35] text-[#F0A202]">!yoyaku / !予約</code>
              <span className="text-[#9CA1AC]">順番待ちに並ぶ</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs px-2 py-1 rounded bg-[#2A2D35] text-[#F0A202]">!torikeshi / !取り消し</code>
              <span className="text-[#9CA1AC]">予約を取り消す</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs px-2 py-1 rounded bg-[#2A2D35] text-[#F0A202]">!kakunin / !確認</code>
              <span className="text-[#9CA1AC]">自分の順番を確認する</span>
            </div>
          </div>
          <p className="text-xs text-[#5A5F6A] mt-4 leading-relaxed">
            ログイン後、ホスト画面から視聴者を「呼び出す」と、チャットへの自動返信とOBSオーバーレイの通知が同時に発生します。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HostApp() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const
    
