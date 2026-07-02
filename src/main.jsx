import React from "react";
import { createRoot } from "react-dom/client";
import HostApp from "./HostApp.jsx";
import OverlayApp from "./OverlayApp.jsx";

// シンプルさ優先で、ルーティングライブラリは使わずパスだけで画面を切り替えている。
// /overlay/xxxxx にアクセスした場合だけOBS用のオーバーレイ画面を表示する。
const overlayMatch = window.location.pathname.match(/^\/overlay\/([a-zA-Z0-9]+)/);

createRoot(document.getElementById("root")).render(
  overlayMatch ? <OverlayApp overlayToken={overlayMatch[1]} /> : <HostApp />
);
