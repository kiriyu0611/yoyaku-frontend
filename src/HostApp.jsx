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
