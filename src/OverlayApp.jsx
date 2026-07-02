import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { CheckCircle2 } from "lucide-react";
import { BACKEND_URL } from "./config.js";

/**
 * OBSの「ブラウザソース」にこのページのURL(/overlay/秘密トークン)を直接登録して使う。
 * 背景を透過にしてあるので、OBS上では配信映像に重なる形で呼び出しポップアップだけが表示される。
 */
export default function OverlayApp({ overlayToken }) {
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, { query: { overlayToken } });

    socket.on("activity:new", (entry) => {
      if (entry.type !== "called") return;
      setPopup({ ...entry, key: `${entry.id}` });
      setTimeout(() => setPopup(null), 3200);
    });

    return () => socket.disconnect();
  }, [overlayToken]);

  return (
    <div style={{ background: "transparent", minHeight: "100vh", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 32 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap');
        body { background: transparent !important; margin: 0; }
        @keyframes popup-in {
          0% { transform: translateY(16px) scale(0.94); opacity: 0; }
          15% { transform: translateY(0) scale(1); opacity: 1; }
          85% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-8px) scale(0.98); opacity: 0; }
        }
        .popup-anim { animation: popup-in 3.2s ease-in-out forwards; }
      `}</style>
      {popup && (
        <div
          key={popup.key}
          className="popup-anim"
          style={{
            background: "#F0A202",
            color: "#0D0F13",
            borderRadius: 12,
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            fontFamily: "'Oswald', sans-serif",
            fontSize: 22,
            letterSpacing: "0.02em",
          }}
        >
          <CheckCircle2 size={26} />
          <span>{popup.username} さん、呼ばれました！</span>
        </div>
      )}
    </div>
  );
}
