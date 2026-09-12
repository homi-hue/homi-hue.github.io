import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type NavPage = "Dashboard" | "Live Monitoring" | "Predictions" | "Alerts" | "About";

// ─── Data ────────────────────────────────────────────────────────────────────
const tempData = [
  { time: "06:00", value: 24 }, { time: "07:00", value: 26 },
  { time: "08:00", value: 28 }, { time: "09:00", value: 30 },
  { time: "10:00", value: 32 }, { time: "11:00", value: 35 },
  { time: "12:00", value: 37 }, { time: "13:00", value: 39 },
  { time: "14:00", value: 41 }, { time: "15:00", value: 39 },
  { time: "16:00", value: 36 }, { time: "17:00", value: 33 },
];

const humidityData = [
  { time: "06:00", value: 68 }, { time: "07:00", value: 62 },
  { time: "08:00", value: 55 }, { time: "09:00", value: 48 },
  { time: "10:00", value: 40 }, { time: "11:00", value: 33 },
  { time: "12:00", value: 28 }, { time: "13:00", value: 24 },
  { time: "14:00", value: 18 }, { time: "15:00", value: 22 },
  { time: "16:00", value: 27 }, { time: "17:00", value: 31 },
];

const riskData = [
  { time: "06:00", value: 12 }, { time: "07:00", value: 18 },
  { time: "08:00", value: 24 }, { time: "09:00", value: 35 },
  { time: "10:00", value: 45 }, { time: "11:00", value: 58 },
  { time: "12:00", value: 69 }, { time: "13:00", value: 78 },
  { time: "14:00", value: 87 }, { time: "15:00", value: 82 },
  { time: "16:00", value: 73 }, { time: "17:00", value: 64 },
];

const alerts = [
  {
    id: 1,
    level: "HIGH" as RiskLevel,
    message: "HIGH FIRE RISK DETECTED",
    location: "Monitoring Zone A — Sector 4",
    temp: 39,
    humidity: 18,
    time: "14:32",
    date: "Aug 30, 2026",
  },
  {
    id: 2,
    level: "MEDIUM" as RiskLevel,
    message: "ELEVATED TEMPERATURE READING",
    location: "Monitoring Zone B — Sector 7",
    temp: 34,
    humidity: 26,
    time: "13:18",
    date: "Aug 30, 2026",
  },
  {
    id: 3,
    level: "LOW" as RiskLevel,
    message: "WIND SPEED INCREASE DETECTED",
    location: "Monitoring Zone C — Sector 2",
    temp: 29,
    humidity: 41,
    time: "11:05",
    date: "Aug 30, 2026",
  },
  {
    id: 4,
    level: "HIGH" as RiskLevel,
    message: "CRITICAL HUMIDITY DROP",
    location: "Monitoring Zone A — Sector 1",
    temp: 37,
    humidity: 15,
    time: "10:47",
    date: "Aug 30, 2026",
  },
  {
    id: 5,
    level: "MEDIUM" as RiskLevel,
    message: "SENSOR ANOMALY DETECTED",
    location: "Monitoring Zone D — Sector 3",
    temp: 31,
    humidity: 35,
    time: "09:22",
    date: "Aug 30, 2026",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function riskColor(level: RiskLevel) {
  if (level === "LOW") return "#22c55e";
  if (level === "MEDIUM") return "#f59e0b";
  if (level === "HIGH") return "#ef4444";
  return "#dc2626";
}

function riskBg(level: RiskLevel) {
  if (level === "LOW") return "rgba(34,197,94,0.1)";
  if (level === "MEDIUM") return "rgba(245,158,11,0.1)";
  if (level === "HIGH") return "rgba(239,68,68,0.1)";
  return "rgba(220,38,38,0.12)";
}

function riskBorder(level: RiskLevel) {
  if (level === "LOW") return "rgba(34,197,94,0.25)";
  if (level === "MEDIUM") return "rgba(245,158,11,0.25)";
  if (level === "HIGH") return "rgba(239,68,68,0.3)";
  return "rgba(220,38,38,0.35)";
}

// ─── Gauge Component ─────────────────────────────────────────────────────────
function RiskGauge({ value, level }: { value: number; level: RiskLevel }) {
  const radius = 72;
  const circumference = Math.PI * radius; // half circle
  const progress = (value / 100) * circumference;
  const color = riskColor(level);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Background arc */}
        <path
          d="M 14 100 A 86 86 0 0 1 186 100"
          fill="none"
          stroke="rgba(21,128,61,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Zone markers */}
        <path
          d="M 14 100 A 86 86 0 0 1 57 24"
          fill="none"
          stroke="rgba(34,197,94,0.4)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 57 24 A 86 86 0 0 1 143 24"
          fill="none"
          stroke="rgba(245,158,11,0.4)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 143 24 A 86 86 0 0 1 186 100"
          fill="none"
          stroke="rgba(239,68,68,0.4)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 14 100 A 86 86 0 0 1 186 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dasharray 1.2s ease-out",
          }}
        />
        {/* Needle */}
        <g transform={`rotate(${-90 + (value / 100) * 180}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={color} />
        </g>
        {/* Center value */}
        <text x="100" y="96" textAnchor="middle" fill={color}
          style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>
          FIRE RISK
        </text>
        {/* Labels */}
        <text x="8" y="110" fill="rgba(34,197,94,0.6)"
          style={{ fontFamily: "var(--font-mono)", fontSize: "9px" }}>LOW</text>
        <text x="78" y="18" fill="rgba(245,158,11,0.6)"
          style={{ fontFamily: "var(--font-mono)", fontSize: "9px" }}>MED</text>
        <text x="160" y="110" fill="rgba(239,68,68,0.6)"
          style={{ fontFamily: "var(--font-mono)", fontSize: "9px" }}>HIGH</text>
      </svg>
    </div>
  );
}

// ─── Map Component ────────────────────────────────────────────────────────────
function ForestMap() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 320, background: "linear-gradient(135deg, #d1fae5 0%, #bbf7d0 50%, #dcfce7 100%)" }}>
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(21,128,61,0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Topographic contours */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <ellipse cx="35%" cy="40%" rx="28%" ry="22%" fill="none" stroke="#16a34a" strokeWidth="1" />
        <ellipse cx="35%" cy="40%" rx="20%" ry="15%" fill="none" stroke="#16a34a" strokeWidth="1" />
        <ellipse cx="65%" cy="55%" rx="22%" ry="18%" fill="none" stroke="#16a34a" strokeWidth="1" />
        <ellipse cx="65%" cy="55%" rx="14%" ry="11%" fill="none" stroke="#16a34a" strokeWidth="1" />
      </svg>

      {/* Forest zones */}
      {/* Safe zones (green) */}
      <div className="absolute rounded-lg opacity-40" style={{ left: "5%", top: "10%", width: "25%", height: "30%", background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.5)" }} />
      <div className="absolute rounded-lg opacity-40" style={{ left: "70%", top: "60%", width: "22%", height: "28%", background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.5)" }} />
      <div className="absolute rounded-lg opacity-35" style={{ left: "8%", top: "55%", width: "18%", height: "32%", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" }} />

      {/* Medium risk zones (amber) */}
      <div className="absolute rounded-lg" style={{ left: "35%", top: "15%", width: "22%", height: "28%", background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", animation: "zone-pulse 3s ease-in-out infinite" }} />
      <div className="absolute rounded-lg" style={{ left: "62%", top: "12%", width: "18%", height: "25%", background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.35)", animation: "zone-pulse 3.5s ease-in-out infinite 0.5s" }} />

      {/* High risk zone (red) */}
      <div className="absolute rounded-lg" style={{ left: "38%", top: "50%", width: "24%", height: "30%", background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.5)", animation: "zone-pulse 2s ease-in-out infinite" }} />

      {/* Sensor nodes */}
      {[
        { x: "30%", y: "35%", label: "S-01", status: "online", risk: "MEDIUM" as RiskLevel },
        { x: "65%", y: "62%", label: "S-02", status: "online", risk: "HIGH" as RiskLevel },
      ].map((s) => (
        <div key={s.label} className="absolute flex flex-col items-center" style={{ left: s.x, top: s.y, transform: "translate(-50%,-50%)" }}>
          <div className="relative">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: riskColor(s.risk),
                boxShadow: `0 0 10px ${riskColor(s.risk)}, 0 0 20px ${riskColor(s.risk)}40`,
                animation: s.risk === "HIGH" ? "alert-pulse 2s ease-in-out infinite" : "pulse-dot 2s ease-in-out infinite",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white opacity-80" />
            </div>
          </div>
          <div className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${riskColor(s.risk)}40`, color: riskColor(s.risk) }}>
            {s.label}
          </div>
        </div>
      ))}

      {/* Compass */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(21,128,61,0.18)", color: "rgba(21,128,61,0.65)" }}>
        N↑
      </div>

      {/* Scale bar */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1">
        <div className="h-0.5 w-12" style={{ background: "rgba(21,128,61,0.35)" }} />
        <span className="text-[9px] font-mono" style={{ color: "rgba(21,128,61,0.45)" }}>5 km</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {[
          { color: "#22c55e", label: "Safe Zone" },
          { color: "#f59e0b", label: "Medium Risk" },
          { color: "#ef4444", label: "High Risk" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm" style={{ background: l.color + "50", border: `1px solid ${l.color}70` }} />
            <span className="text-[9px] font-mono" style={{ color: "rgba(30,80,50,0.55)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Coordinates */}
      <div className="absolute top-3 left-3 text-[9px] font-mono" style={{ color: "rgba(21,128,61,0.35)" }}>
        3.1390°N 101.6869°E
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs" style={{ fontFamily: "var(--font-mono)" }}>
      <p style={{ color: "rgba(30,80,50,0.65)" }}>{label}</p>
      <p style={{ color: "#0f2d1a", fontWeight: 600 }}>{payload[0].value}{unit}</p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState<NavPage>("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [temperature] = useState(39);
  const [humidity] = useState(18);
  const [fireProbability] = useState(87);
  const currentRisk: RiskLevel = "HIGH";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks: NavPage[] = ["Dashboard", "Live Monitoring", "Predictions", "Alerts", "About"];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #e8f5ee 0%, #f0f7f2 40%, #eaf4ef 100%)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Subtle background texture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, #16a34a 0%, transparent 50%), radial-gradient(circle at 80% 70%, #16a34a 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header
          className="sticky top-0"
          style={{
            background: "rgba(240,247,242,0.9)",
            borderBottom: "1px solid rgba(21,128,61,0.12)",
            backdropFilter: "blur(16px)",
            zIndex: 50,
          }}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)", border: "1px solid rgba(21,128,61,0.25)" }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2C11 2 7 6 7 10C7 12.2 8.8 14 11 14C13.2 14 15 12.2 15 10C15 6 11 2 11 2Z" fill="#ef4444" opacity="0.9" />
                  <path d="M11 5C11 5 9 8 9 10C9 11.1 9.9 12 11 12C12.1 12 13 11.1 13 10C13 8 11 5 11 5Z" fill="#f97316" />
                  <path d="M6 14C4.5 15 4 17 5 18.5C4 16.5 3 16 3 18C3 19.7 4.3 21 6 21C8 21 9 19.5 8 18C8.5 19 9.5 19.5 10.5 19C9 18 8.5 16 9 14.5" fill="#16a34a" opacity="0.8" />
                  <path d="M13 14.5C13.5 16 13 18 11.5 19C12.5 19.5 13.5 19 14 18C13 19.5 14 21 16 21C17.7 21 19 19.7 19 18C19 16 18 16.5 17 18.5C18 17 17.5 15 16 14" fill="#16a34a" opacity="0.8" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "#0f2d1a", letterSpacing: "0.03em" }}>
                  FireWatch<span style={{ color: "#16a34a" }}> AI</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(21,128,61,0.45)", letterSpacing: "0.1em" }}>
                  EARLY WARNING SYSTEM
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => setActivePage(link)}
                  className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    color: activePage === link ? "#16a34a" : "rgba(30,80,50,0.65)",
                    background: activePage === link ? "rgba(21,128,61,0.08)" : "transparent",
                    border: activePage === link ? "1px solid rgba(21,128,61,0.18)" : "1px solid transparent",
                  }}
                >
                  {link}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Status pill */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#ef4444" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#ef4444" }}>ALERT ACTIVE</span>
              </div>

              {/* Clock */}
              <div className="hidden lg:block" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "rgba(21,128,61,0.45)" }}>
                {currentTime.toLocaleTimeString()}
              </div>

              {/* User */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "rgba(21,128,61,0.08)", border: "1px solid rgba(21,128,61,0.18)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="#16a34a" strokeWidth="1.5" />
                  <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(21,128,61,0.08)", border: "1px solid rgba(21,128,61,0.12)" }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  {mobileMenuOpen ? (
                    <>
                      <line x1="3" y1="3" x2="13" y2="13" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="13" y1="3" x2="3" y2="13" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <line x1="2" y1="4.5" x2="14" y2="4.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="2" y1="8" x2="14" y2="8" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="2" y1="11.5" x2="14" y2="11.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div
              className="md:hidden px-4 py-3 border-t"
              style={{ borderColor: "rgba(21,128,61,0.08)", background: "rgba(240,247,242,0.97)" }}
            >
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => { setActivePage(link); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg mb-1 text-sm"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: activePage === link ? "#16a34a" : "rgba(138,184,154,0.8)",
                    background: activePage === link ? "rgba(21,128,61,0.08)" : "transparent",
                  }}
                >
                  {link}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── Hero / Status Banner ─────────────────────────────────────── */}
          <div
            className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(232,244,236,0.8) 50%, rgba(240,247,242,0.85) 100%)",
              border: "1px solid rgba(21,128,61,0.12)",
            }}
          >
            {/* Decorative lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(21,128,61,0.3), transparent)" }} />
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #16a34a, transparent)" }} />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #ef4444, transparent)" }} />
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-0.5 w-8" style={{ background: "#16a34a" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(21,128,61,0.55)", letterSpacing: "0.15em" }}>
                    SYSTEM ACTIVE · VERSION 2.4.1
                  </span>
                </div>
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
                  style={{ fontFamily: "var(--font-display)", color: "#0f2d1a", letterSpacing: "-0.01em" }}
                >
                  AI-Powered Forest Fire<br />
                  <span style={{ color: "#16a34a" }}>Early Warning</span> System
                </h1>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(30,80,50,0.65)", maxWidth: 480 }}>
                  Real-time environmental monitoring and machine learning–based fire risk prediction.
                  Powered by Random Forest AI across 2 sensor nodes.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(21,128,61,0.55)", fontFamily: "var(--font-mono)" }}>
                    <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#16a34a" }} />
                    2 SENSORS ONLINE
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(30,80,50,0.5)", fontFamily: "var(--font-mono)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(30,80,50,0.4)" }} />
                    LAST SYNC: JUST NOW
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(245,158,11,0.7)", fontFamily: "var(--font-mono)" }}>
                    <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#f59e0b" }} />
                    1 ACTIVE ALERT
                  </div>
                </div>
              </div>

              {/* Current risk card */}
              <div
                className="glow-fire flex-shrink-0 rounded-xl p-5 min-w-[220px]"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(239,68,68,0.6)", letterSpacing: "0.12em", marginBottom: 8 }}>
                  CURRENT FIRE RISK STATUS
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl alert-pulse"
                    style={{ background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)" }}
                  >
                    🔥
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "#ef4444", lineHeight: 1 }}>
                      HIGH
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(239,68,68,0.6)" }}>
                      RISK LEVEL
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(239,68,68,0.15)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(30,80,50,0.5)" }}>AI CONFIDENCE</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "#ef4444" }}>HIGH</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sensor Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Temperature */}
            <div
              className="glass glow-fire card-hover rounded-xl p-4 sm:p-5"
              style={{ borderColor: "rgba(239,68,68,0.2)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  🌡️
                </div>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#ef4444" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>
                TEMPERATURE
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, color: "#ef4444", lineHeight: 1 }}>
                {temperature}<span style={{ fontSize: "16px", fontWeight: 400 }}>°C</span>
              </div>
              <div className="mt-2 text-xs" style={{ color: "rgba(239,68,68,0.6)", fontFamily: "var(--font-mono)" }}>
                ↑ +7°C above avg
              </div>

            </div>

            {/* Humidity */}
            <div
              className="glass card-hover rounded-xl p-4 sm:p-5"
              style={{ borderColor: "rgba(245,158,11,0.2)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  💧
                </div>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#f59e0b" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>
                HUMIDITY
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, color: "#f59e0b", lineHeight: 1 }}>
                {humidity}
              </div>
              <div className="mt-2 text-xs" style={{ color: "rgba(245,158,11,0.6)", fontFamily: "var(--font-mono)" }}>
                ↓ Below avg
              </div>
            </div>

            {/* Device Status */}
            <div
              className="glass card-hover rounded-xl p-4 sm:p-5"
              style={{ borderColor: "rgba(21,128,61,0.12)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(21,128,61,0.08)", border: "1px solid rgba(21,128,61,0.12)" }}
                >
                  📡
                </div>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#16a34a" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>
                DEVICE STATUS
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "#16a34a", lineHeight: 1.2 }}>
                ONLINE
              </div>
              <div className="mt-2 text-xs" style={{ color: "rgba(21,128,61,0.45)", fontFamily: "var(--font-mono)" }}>
                2/2 NODES ACTIVE
              </div>
            </div>

            {/* Last Updated */}
            <div
              className="glass card-hover rounded-xl p-4 sm:p-5"
              style={{ borderColor: "rgba(21,128,61,0.12)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(21,128,61,0.08)", border: "1px solid rgba(21,128,61,0.12)" }}
                >
                  🕒
                </div>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#16a34a" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>
                LAST UPDATED
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "#0f2d1a", lineHeight: 1.2 }}>
                Just now
              </div>
              <div className="mt-2 text-xs" style={{ color: "rgba(30,80,50,0.4)", fontFamily: "var(--font-mono)" }}>
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* ── Prediction + Map ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* AI Prediction Panel */}
            <div
              className="glass glow-fire lg:col-span-2 rounded-xl p-5 sm:p-6"
              style={{ borderColor: "rgba(239,68,68,0.2)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.12em" }}>
                    AI PREDICTION ENGINE
                  </div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "#0f2d1a", marginTop: 2 }}>
                    Fire Risk Analysis
                  </h2>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ fontFamily: "var(--font-mono)", background: "rgba(21,128,61,0.08)", border: "1px solid rgba(21,128,61,0.18)", color: "#16a34a" }}
                >
                  LIVE
                </div>
              </div>

              {/* Gauge */}
              <div className="flex justify-center mb-4">
                <RiskGauge value={fireProbability} level={currentRisk} />
              </div>

              {/* Stats */}
              <div className="space-y-2.5">
                {[
                  { label: "RISK LEVEL", value: "HIGH", color: "#ef4444" },
                  { label: "FIRE PROBABILITY", value: "HIGH", color: "#ef4444" },
                  { label: "AI MODEL", value: "Random Forest", color: "#0f2d1a" },
                  { label: "PREDICTION CONFIDENCE", value: "VERY HIGH", color: "#16a34a" },
                  { label: "LAST INFERENCE", value: "14:32:07", color: "rgba(30,80,50,0.65)" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "rgba(21,128,61,0.04)", border: "1px solid rgba(21,128,61,0.07)" }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.08em" }}>
                      {item.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 600, color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Forest Map */}
            <div className="glass lg:col-span-3 rounded-xl p-5 sm:p-6" style={{ borderColor: "rgba(21,128,61,0.12)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.12em" }}>
                    FOREST MONITORING NETWORK
                  </div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "#0f2d1a", marginTop: 2 }}>
                    Sensor Coverage Map
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#16a34a" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(21,128,61,0.45)" }}>LIVE FEED</span>
                </div>
              </div>
              <ForestMap />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Zone A", risk: "HIGH" as RiskLevel, temp: "39°C", hum: "18%" },
                  { label: "Zone B", risk: "MEDIUM" as RiskLevel, temp: "34°C", hum: "26%" },
                  { label: "Zone C", risk: "LOW" as RiskLevel, temp: "27°C", hum: "52%" },
                ].map((z) => (
                  <div
                    key={z.label}
                    className="rounded-lg p-2.5"
                    style={{ background: riskBg(z.risk), border: `1px solid ${riskBorder(z.risk)}` }}
                  >
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: riskColor(z.risk), letterSpacing: "0.08em" }}>{z.label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 600, color: riskColor(z.risk) }}>{z.risk}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(30,80,50,0.5)", marginTop: 2 }}>
                      {z.temp} · {z.hum}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Charts ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Temperature Chart */}
            <div className="glass card-hover rounded-xl p-5" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(30,80,50,0.4)", letterSpacing: "0.12em", marginBottom: 2 }}>
                TODAY · ZONE A
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600, color: "#0f2d1a", marginBottom: 12 }}>
                Temperature (°C)
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={tempData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,128,61,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: "rgba(30,80,50,0.4)", fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: "rgba(30,80,50,0.4)", fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="°C" />} />
                  <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#tempGrad)" dot={false} activeDot={{ r: 4, fill: "#ef4444", stroke: "rgba(239,68,68,0.3)", strokeWidth: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div className="glass card-hover rounded-xl p-5" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(30,80,50,0.4)", letterSpacing: "0.12em", marginBottom: 2 }}>
                TODAY · ZONE A
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600, color: "#0f2d1a", marginBottom: 12 }}>
                Humidity Level
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={humidityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,128,61,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: "rgba(30,80,50,0.4)", fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: "rgba(30,80,50,0.4)", fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="" />} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#humGrad)" dot={false} activeDot={{ r: 4, fill: "#3b82f6", stroke: "rgba(59,130,246,0.3)", strokeWidth: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Fire Risk Trend */}
            <div className="glass card-hover rounded-xl p-5" style={{ borderColor: "rgba(249,115,22,0.15)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(30,80,50,0.4)", letterSpacing: "0.12em", marginBottom: 2 }}>
                TODAY · ALL ZONES
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600, color: "#0f2d1a", marginBottom: 12 }}>
                Fire Risk Trend
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={riskData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,128,61,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: "rgba(30,80,50,0.4)", fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: "rgba(30,80,50,0.4)", fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip unit="" />} />
                  <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#riskGrad)" dot={false} activeDot={{ r: 4, fill: "#f97316", stroke: "rgba(249,115,22,0.3)", strokeWidth: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Alert System ─────────────────────────────────────────────── */}
          <div className="glass rounded-xl p-5 sm:p-6" style={{ borderColor: "rgba(21,128,61,0.12)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.5)", letterSpacing: "0.12em" }}>
                  REAL-TIME MONITORING
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "#0f2d1a", marginTop: 2 }}>
                  Alert System
                </h2>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <div className="w-2 h-2 rounded-full alert-pulse" style={{ background: "#ef4444" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#ef4444" }}>
                  2 ACTIVE
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.005]"
                  style={{
                    background: riskBg(alert.level),
                    border: `1px solid ${riskBorder(alert.level)}`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: riskBg(alert.level), border: `1px solid ${riskBorder(alert.level)}` }}
                      >
                        {alert.level === "HIGH" ? "🚨" : alert.level === "MEDIUM" ? "⚠️" : "ℹ️"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{ background: riskBg(alert.level), color: riskColor(alert.level), border: `1px solid ${riskBorder(alert.level)}` }}
                          >
                            {alert.level}
                          </span>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 600, color: "#0f2d1a" }}>
                            {alert.message}
                          </span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(30,80,50,0.55)" }}>
                          📍 {alert.location}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-3">
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(239,68,68,0.7)" }}>
                            🌡️ {alert.temp}°C
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(59,130,246,0.7)" }}>
                            💧 {alert.humidity}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-11 sm:ml-0">
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: riskColor(alert.level), fontWeight: 600 }}>
                        {alert.time}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(30,80,50,0.4)" }}>
                        {alert.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── System Status Footer ─────────────────────────────────────── */}
          <div className="glass rounded-xl p-4 sm:p-5" style={{ borderColor: "rgba(21,128,61,0.08)" }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "AI MODEL ACCURACY", value: "HIGH", color: "#16a34a" },
                { label: "DATA POINTS TODAY", value: "14,832", color: "#0f2d1a" },
                { label: "ALERTS DISPATCHED", value: "5", color: "#f59e0b" },
                { label: "SYSTEM UPTIME", value: "OPTIMAL", color: "#16a34a" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: s.color }}>
                    {s.value}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(30,80,50,0.4)", letterSpacing: "0.08em", marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-4">
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(21,128,61,0.25)", letterSpacing: "0.1em" }}>
              FIREWATCH AI v2.4.1 · ESP32 SENSOR NETWORK · RANDOM FOREST ML MODEL · © 2026
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
