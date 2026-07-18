import { useState, useCallback } from "react";
import {
  Monitor, Volume2, Wifi, Bluetooth, Tv2, Brain, Wrench, SlidersHorizontal, Info,
  ChevronRight, ChevronLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ItemType = "slider" | "toggle" | "step" | "arrow" | "button" | "section-header";

interface SettingItem {
  id: string;
  label: string;
  type: ItemType;
  value?: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
  optionIndex?: number;
  suffix?: string;
  disabled?: boolean;
  subtitle?: string;
}

interface SubPanel {
  id: string;
  title: string;
  items: SettingItem[];
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: SettingItem[];
  subPanels?: SubPanel[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_CATEGORIES: Category[] = [
  {
    id: "image",
    label: "图像",
    icon: <Monitor size={20} strokeWidth={1.5} />,
    items: [
      { id: "mode", label: "图效模式", type: "step", options: ["FILMMAKER", "标准", "电影", "运动", "游戏", "用户"], optionIndex: 0 },
      { id: "advanced", label: "高级设置", type: "section-header" },
      { id: "brightness", label: "亮度", type: "arrow" },
      { id: "color", label: "色彩", type: "arrow" },
      { id: "motion", label: "运动", type: "arrow" },
      { id: "sharpness", label: "清晰度", type: "arrow" },
      { id: "range", label: "信号范围", type: "arrow", value: "自动", disabled: true },
      { id: "display_std", label: "显示标准", type: "arrow", value: "自动", disabled: true },
    ],
    subPanels: [
      {
        id: "brightness",
        title: "亮度",
        items: [
          { id: "brightness_val", label: "亮度", type: "slider", value: 100, min: 0, max: 100 },
          { id: "contrast", label: "对比度", type: "slider", value: 50, min: 0, max: 100 },
          { id: "gamma", label: "伽马", type: "step", options: ["2.0", "2.2", "2.4", "2.6"], optionIndex: 1 },
          { id: "auto_hdr", label: "自动HDR转换", type: "toggle", value: false, disabled: true },
          { id: "hdr_mapping", label: "HDR动态色调映射", type: "step", options: ["关闭", "自动", "低", "中", "高"], optionIndex: 0, disabled: true },
          { id: "black_level", label: "黑电平", type: "slider", value: 50, min: 0, max: 100 },
          { id: "black_ext", label: "黑电平延伸", type: "toggle", value: false, disabled: true },
          { id: "dynamic_contrast", label: "动态对比度", type: "toggle", value: false, disabled: true },
        ],
      },
      {
        id: "color",
        title: "色彩",
        items: [
          { id: "saturation", label: "饱和度", type: "slider", value: 50, min: 0, max: 100 },
          { id: "hue", label: "色调", type: "slider", value: 50, min: 0, max: 100 },
          { id: "color_temp", label: "色温", type: "step", options: ["冷", "中性", "暖", "自定义"], optionIndex: 2 },
          { id: "color_enhance", label: "色彩增强", type: "toggle", value: false, disabled: true },
          { id: "white_balance", label: "白平衡", type: "arrow" },
          { id: "color_space", label: "色彩空间", type: "arrow", value: "原始" },
        ],
      },
      {
        id: "motion",
        title: "运动",
        items: [
          { id: "motion_comp", label: "运动补偿", type: "arrow", value: "中" },
          { id: "hz240", label: "240Hz动态加速", type: "toggle", value: true },
          { id: "led_motion", label: "LED运动清晰", type: "toggle", value: false },
          { id: "film24p", label: "24p原帧电影", type: "toggle", value: false },
        ],
      },
      {
        id: "sharpness",
        title: "清晰度",
        items: [
          { id: "sharpness_val", label: "锐利度", type: "slider", value: 10, min: 0, max: 100 },
          { id: "water_smooth", label: "水印平滑", type: "toggle", value: false },
          { id: "mpeg_noise", label: "MPEG降噪", type: "slider", value: 20, min: 0, max: 100, disabled: true },
          { id: "noise_red", label: "降噪", type: "step", options: ["低", "中", "高", "关闭"], optionIndex: 0, disabled: true },
          { id: "uhd", label: "超清分辨率", type: "toggle", value: false, disabled: true },
          { id: "precise", label: "精准细节", type: "toggle", value: true },
        ],
      },
    ],
  },
  {
    id: "sound",
    label: "声音",
    icon: <Volume2 size={20} strokeWidth={1.5} />,
    items: [
      { id: "sound_mode", label: "声音模式", type: "step", options: ["标准", "电影", "音乐", "新闻", "运动"], optionIndex: 0 },
      { id: "volume", label: "音量", type: "slider", value: 50, min: 0, max: 100 },
      { id: "bass", label: "低音", type: "slider", value: 50, min: 0, max: 100 },
      { id: "treble", label: "高音", type: "slider", value: 50, min: 0, max: 100 },
      { id: "surround", label: "环绕声", type: "toggle", value: false },
      { id: "audio_out", label: "音频输出设备", type: "arrow", value: "自动（扬声器）" },
      { id: "audio_delay", label: "音频延迟", type: "slider", value: 0, min: 0, max: 250 },
    ],
  },
  {
    id: "network",
    label: "网络",
    icon: <Wifi size={20} strokeWidth={1.5} />,
    items: [
      { id: "wifi", label: "无线网络", type: "arrow", value: "000TP-LINK" },
      { id: "wired", label: "有线网络", type: "toggle", value: false },
      { id: "ip_config", label: "IP设置", type: "arrow" },
      { id: "dns", label: "DNS", type: "arrow" },
    ],
  },
  {
    id: "bluetooth",
    label: "蓝牙",
    icon: <Bluetooth size={20} strokeWidth={1.5} />,
    items: [
      { id: "bt_remote", label: "蓝牙遥控器", type: "arrow" },
      { id: "bt_headset", label: "蓝牙耳机", type: "arrow" },
      { id: "bt_speaker", label: "蓝牙音箱", type: "arrow" },
    ],
  },
  {
    id: "source",
    label: "信号源",
    icon: <Tv2 size={20} strokeWidth={1.5} />,
    items: [
      { id: "hdmi1", label: "HDMI 1", type: "arrow", value: "未接入" },
      { id: "hdmi2", label: "HDMI 2", type: "arrow", value: "未接入" },
      { id: "hdmi3", label: "HDMI 3", type: "arrow", value: "未接入" },
      { id: "av", label: "AV", type: "arrow", value: "未接入" },
    ],
  },
  {
    id: "ai",
    label: "AI智能",
    icon: <Brain size={20} strokeWidth={1.5} />,
    items: [
      { id: "ai_scene", label: "场景智能识别", type: "toggle", value: true },
      { id: "ai_sound", label: "AI声音优化", type: "toggle", value: false },
      { id: "ai_ambient", label: "环境光感应", type: "toggle", value: true },
      { id: "ai_eco", label: "AI节能", type: "toggle", value: false },
    ],
  },
  {
    id: "general",
    label: "通用",
    icon: <Wrench size={20} strokeWidth={1.5} />,
    items: [
      { id: "language", label: "语言", type: "arrow", value: "简体中文" },
      { id: "time", label: "时间设置", type: "arrow" },
      { id: "sleep", label: "睡眠定时", type: "arrow", value: "关" },
      { id: "startup", label: "开机画面", type: "toggle", value: true },
      { id: "power_save", label: "节能模式", type: "toggle", value: false },
    ],
  },
  {
    id: "custom",
    label: "个性化",
    icon: <SlidersHorizontal size={20} strokeWidth={1.5} />,
    items: [
      { id: "theme", label: "主题", type: "arrow" },
      { id: "wallpaper", label: "壁纸", type: "arrow" },
      { id: "screensaver", label: "屏幕保护", type: "arrow" },
      { id: "menu_style", label: "菜单样式", type: "step", options: ["默认", "简洁", "儿童"], optionIndex: 0 },
    ],
  },
  {
    id: "about",
    label: "关于",
    icon: <Info size={20} strokeWidth={1.5} />,
    items: [
      { id: "model", label: "型号", type: "arrow", value: "HISENSE 75U8H" },
      { id: "serial", label: "序列号", type: "arrow", value: "SN123456789" },
      { id: "version", label: "系统版本", type: "arrow", value: "V1.2.3" },
      { id: "update", label: "检查更新", type: "button" },
      { id: "factory", label: "恢复出厂设置", type: "button" },
    ],
  },
];

// ─── State ───────────────────────────────────────────────────────────────────

type Settings = Record<string, number | boolean | string>;

function buildInitialSettings(cats: Category[]): Settings {
  const s: Settings = {};
  const processItems = (items: SettingItem[]) => {
    for (const item of items) {
      if (item.type === "slider" && typeof item.value === "number") s[item.id] = item.value;
      if (item.type === "toggle" && typeof item.value === "boolean") s[item.id] = item.value;
      if (item.type === "step" && item.optionIndex !== undefined) s[`${item.id}_idx`] = item.optionIndex;
      if (item.type === "arrow" && item.value !== undefined) s[item.id] = item.value as string;
    }
  };
  for (const cat of cats) {
    processItems(cat.items);
    for (const sub of cat.subPanels ?? []) processItems(sub.items);
  }
  return s;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toggle({ on, disabled, onChange }: { on: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      onClick={!disabled ? onChange : undefined}
      className={[
        "relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none",
        disabled ? "opacity-35 cursor-default" : "cursor-pointer",
        on ? "bg-primary" : "bg-[var(--switch-background)]",
      ].join(" ")}
      aria-checked={on}
      role="switch"
    >
      <span
        className={[
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          on ? "translate-x-6" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

function Slider({
  value,
  min = 0,
  max = 100,
  disabled,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="tv-slider w-full"
      style={
        {
          "--pct": `${pct}%`,
          opacity: disabled ? 0.35 : 1,
        } as React.CSSProperties
      }
    />
  );
}

function StepPicker({
  options,
  index,
  disabled,
  onChange,
}: {
  options: string[];
  index: number;
  disabled?: boolean;
  onChange: (i: number) => void;
}) {
  const prev = () => !disabled && onChange((index - 1 + options.length) % options.length);
  const next = () => !disabled && onChange((index + 1) % options.length);
  return (
    <div className={`flex items-center gap-3 ${disabled ? "opacity-35" : ""}`}>
      <button onClick={prev} className="text-muted-foreground hover:text-white transition-colors">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-white min-w-[4rem] text-center">{options[index]}</span>
      <button onClick={next} className="text-muted-foreground hover:text-white transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Setting Row ─────────────────────────────────────────────────────────────

function SettingRow({
  item,
  focused,
  settings,
  onFocus,
  onChange,
  onArrowClick,
}: {
  item: SettingItem;
  focused: boolean;
  settings: Settings;
  onFocus: () => void;
  onChange: (id: string, val: number | boolean | string) => void;
  onArrowClick?: (id: string) => void;
}) {
  if (item.type === "section-header") {
    return (
      <div className="px-5 pt-5 pb-2">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">{item.label}</span>
      </div>
    );
  }

  const sliderVal = typeof settings[item.id] === "number" ? (settings[item.id] as number) : (item.value as number ?? 0);
  const toggleVal = typeof settings[item.id] === "boolean" ? (settings[item.id] as boolean) : (item.value as boolean ?? false);
  const stepIdx = typeof settings[`${item.id}_idx`] === "number" ? (settings[`${item.id}_idx`] as number) : (item.optionIndex ?? 0);

  const isSlider = item.type === "slider";
  const isToggle = item.type === "toggle";
  const isStep = item.type === "step";
  const isArrow = item.type === "arrow";
  const isButton = item.type === "button";

  const rowBg = focused
    ? isSlider
      ? "bg-[rgba(255,255,255,0.13)]"
      : "bg-[rgba(255,255,255,0.09)]"
    : "bg-transparent";

  return (
    <div
      className={[
        "mx-2 px-4 rounded-xl transition-colors duration-150 cursor-pointer select-none",
        item.disabled ? "opacity-40" : "",
        rowBg,
        isSlider ? "py-4" : "py-0",
      ].join(" ")}
      onMouseEnter={onFocus}
      onClick={() => {
        onFocus();
        if (isToggle && !item.disabled) onChange(item.id, !toggleVal);
        if (isArrow && !item.disabled && onArrowClick) onArrowClick(item.id);
        if (isButton) onArrowClick?.(item.id);
      }}
    >
      {isSlider ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-white">{item.label}</span>
            <span className="text-base font-medium text-white tabular-nums">{sliderVal}</span>
          </div>
          <Slider
            value={sliderVal}
            min={item.min}
            max={item.max}
            disabled={item.disabled}
            onChange={(v) => onChange(item.id, v)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between min-h-[56px]">
          <span className={`text-base ${item.disabled ? "text-muted-foreground" : "text-white"} font-medium`}>
            {item.label}
          </span>
          <div className="flex items-center gap-2 ml-4">
            {isToggle && (
              <Toggle
                on={toggleVal}
                disabled={item.disabled}
                onChange={() => onChange(item.id, !toggleVal)}
              />
            )}
            {isStep && (
              <StepPicker
                options={item.options ?? []}
                index={stepIdx}
                disabled={item.disabled}
                onChange={(i) => onChange(`${item.id}_idx`, i)}
              />
            )}
            {isArrow && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {item.value && <span className="text-sm">{item.value as string}</span>}
                <ChevronRight size={16} />
              </div>
            )}
            {isButton && (
              <span className="text-sm text-primary">操作</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeCatId, setActiveCatId] = useState("image");
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(buildInitialSettings(NAV_CATEGORIES));

  const activeCat = NAV_CATEGORIES.find((c) => c.id === activeCatId)!;
  const activeSub = activeCat.subPanels?.find((s) => s.id === activeSubId) ?? null;

  const handleChange = useCallback((id: string, val: number | boolean | string) => {
    setSettings((prev) => ({ ...prev, [id]: val }));
  }, []);

  const handleArrowClick = (id: string) => {
    const sub = activeCat.subPanels?.find((s) => s.id === id);
    if (sub) setActiveSubId(id);
  };

  const displayItems = activeSub ? activeSub.items : activeCat.items;
  const panelTitle = activeSub ? activeSub.title : activeCat.label;

  return (
    <div
      className="w-full h-screen flex overflow-hidden font-[var(--font-sans)]"
      style={{ background: "var(--tv-panel-bg)" }}
    >
      {/* Slider CSS */}
      <style>{`
        .tv-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(
            to right,
            #4b7bff 0%,
            #4b7bff var(--pct),
            rgba(255,255,255,0.18) var(--pct),
            rgba(255,255,255,0.18) 100%
          );
        }
        .tv-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4b7bff;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(75,123,255,0.25);
        }
        .tv-slider:disabled {
          cursor: default;
        }
        .tv-slider:disabled::-webkit-slider-thumb {
          background: rgba(255,255,255,0.35);
          box-shadow: none;
        }
        .tv-slider:disabled {
          background: linear-gradient(
            to right,
            rgba(255,255,255,0.35) 0%,
            rgba(255,255,255,0.35) var(--pct),
            rgba(255,255,255,0.12) var(--pct),
            rgba(255,255,255,0.12) 100%
          ) !important;
        }
      `}</style>

      {/* ── Left Icon Nav ─────────────────────────────────────────── */}
      <nav
        className="flex flex-col items-center py-8 gap-1 flex-shrink-0 w-[72px]"
        style={{ background: "var(--tv-nav-bg)" }}
      >
        {NAV_CATEGORIES.map((cat) => {
          const active = cat.id === activeCatId;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCatId(cat.id);
                setActiveSubId(null);
                setFocusedItemId(null);
              }}
              className={[
                "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 gap-0.5",
                active
                  ? "bg-primary/20 text-primary"
                  : "text-[#5a6480] hover:text-white hover:bg-white/5",
              ].join(" ")}
              title={cat.label}
            >
              {cat.icon}
            </button>
          );
        })}
      </nav>

      {/* ── Middle Panel ──────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 w-[320px] overflow-hidden"
        style={{ background: "var(--tv-panel-bg)" }}
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex-shrink-0">
          {activeSub ? (
            <button
              className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors mb-3 text-sm"
              onClick={() => { setActiveSubId(null); setFocusedItemId(null); }}
            >
              <ChevronLeft size={14} />
              <span>{activeCat.label}</span>
            </button>
          ) : null}
          <h1 className="text-2xl font-medium text-white tracking-tight">{panelTitle}</h1>
          {!activeSub && activeCatId === "image" && (
            <p className="text-xs text-muted-foreground mt-1 tracking-wider">SDR</p>
          )}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto pb-6 space-y-0.5 scroll-smooth">
          {displayItems.map((item) => (
            <SettingRow
              key={item.id}
              item={item}
              focused={focusedItemId === item.id}
              settings={settings}
              onFocus={() => setFocusedItemId(item.id)}
              onChange={handleChange}
              onArrowClick={handleArrowClick}
            />
          ))}
        </div>
      </div>

      {/* ── Right Preview Area ────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Cinematic background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0a0c1a 0%, #111827 40%, #1a1200 70%, #0a0a14 100%)",
          }}
        />
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />
        {/* Scene silhouette - abstract warm interior */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Warm light from upper left */}
            <div
              className="absolute top-0 left-0 w-3/4 h-1/2 opacity-20 rounded-br-full"
              style={{ background: "radial-gradient(ellipse at 20% 10%, #8B6914 0%, transparent 70%)" }}
            />
            {/* Deep shadow foreground */}
            <div
              className="absolute bottom-0 left-0 right-0 h-2/3 opacity-80"
              style={{ background: "linear-gradient(to top, #050608 0%, transparent 100%)" }}
            />
            {/* Scene label */}
            <div className="absolute bottom-8 right-8 text-right">
              <div className="text-[10px] text-white/20 tracking-widest uppercase mb-1">Preview</div>
              <div className="text-xs text-white/30 font-light">{activeCat.label}</div>
            </div>
          </div>
        </div>

        {/* Design system card overlay */}
        <div className="absolute top-6 right-6 bottom-6 w-72 flex flex-col gap-3">
          {/* Token reference card */}
          <div
            className="rounded-2xl p-4 backdrop-blur-sm flex-shrink-0"
            style={{ background: "rgba(22,25,41,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-3">设计规范</div>
            <div className="space-y-2">
              <TokenRow label="背景" swatch="#12152a" />
              <TokenRow label="面板" swatch="#161929" />
              <TokenRow label="卡片" swatch="#1c2038" />
              <TokenRow label="焦点" swatch="rgba(255,255,255,0.11)" />
              <TokenRow label="主色" swatch="#4b7bff" />
              <TokenRow label="次要文字" swatch="#7d8aaa" />
              <TokenRow label="分割线" swatch="rgba(255,255,255,0.07)" />
            </div>
          </div>

          {/* Component showcase */}
          <div
            className="rounded-2xl p-4 backdrop-blur-sm flex-1 overflow-y-auto"
            style={{ background: "rgba(22,25,41,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-3">组件库</div>
            <div className="space-y-4">
              {/* Toggle states */}
              <ComponentSection label="开关">
                <div className="flex gap-4 items-center">
                  <Toggle on={true} onChange={() => {}} />
                  <Toggle on={false} onChange={() => {}} />
                  <Toggle on={false} disabled onChange={() => {}} />
                </div>
              </ComponentSection>

              {/* Slider */}
              <ComponentSection label="滑块">
                <div
                  className="px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-white">亮度</span>
                    <span className="text-xs text-white tabular-nums">
                      {typeof settings["brightness_val"] === "number" ? settings["brightness_val"] : 100}
                    </span>
                  </div>
                  <Slider
                    value={typeof settings["brightness_val"] === "number" ? settings["brightness_val"] as number : 100}
                    onChange={(v) => handleChange("brightness_val", v)}
                  />
                </div>
              </ComponentSection>

              {/* Step picker */}
              <ComponentSection label="步进选择">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">图效模式</span>
                  <StepPicker
                    options={["FILMMAKER", "标准", "电影"]}
                    index={typeof settings["mode_idx"] === "number" ? settings["mode_idx"] as number : 0}
                    onChange={(i) => handleChange("mode_idx", i)}
                  />
                </div>
              </ComponentSection>

              {/* Nav item states */}
              <ComponentSection label="菜单项状态">
                <div className="space-y-1">
                  <div
                    className="px-3 py-2 rounded-lg text-xs text-white flex justify-between"
                    style={{ background: "rgba(255,255,255,0.11)" }}
                  >
                    <span>亮度（焦点）</span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                  <div className="px-3 py-2 rounded-lg text-xs text-white flex justify-between hover:bg-white/5">
                    <span>色彩（默认）</span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                  <div className="px-3 py-2 rounded-lg text-xs flex justify-between opacity-40">
                    <span className="text-muted-foreground">信号范围（禁用）</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span>自动</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </ComponentSection>

              {/* Typography scale */}
              <ComponentSection label="字体层级">
                <div className="space-y-1">
                  <div className="text-xl font-medium text-white">标题 / 24px</div>
                  <div className="text-base text-white">正文 / 16px</div>
                  <div className="text-sm text-muted-foreground">辅助 / 14px</div>
                  <div className="text-xs text-[var(--tv-text-dim)]">标签 / 12px</div>
                </div>
              </ComponentSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenRow({ label, swatch }: { label: string; swatch: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded flex-shrink-0 border border-white/10"
        style={{ background: swatch }}
      />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-[10px] text-[var(--tv-text-dim)] font-mono">{swatch}</span>
    </div>
  );
}

function ComponentSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-[#3d4562] uppercase tracking-widest mb-2">{label}</div>
      {children}
    </div>
  );
}
