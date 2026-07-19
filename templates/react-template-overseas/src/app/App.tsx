import { useState } from "react";
import {
  ChevronLeft, ChevronRight, RotateCcw, Settings,
  Wifi, Bluetooth, Monitor, Volume2, Accessibility,
  Tv, Sun, Palette, Zap, Wind,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Screen = "quick" | "picture" | "brightness" | "color" | "clarity" | "motion";
type Tab = "screens" | "components" | "tokens";

// ─────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────

function Toggle({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return (
    <div
      className={`relative flex-shrink-0 w-[52px] h-[28px] rounded-full transition-colors duration-200 ${
        disabled
          ? "bg-[#38383a]"
          : checked
          ? "bg-[#4285f4]"
          : "bg-[#48484a]"
      }`}
    >
      <div
        className={`absolute top-[3px] w-[22px] h-[22px] rounded-full shadow-md transition-all duration-200 ${
          disabled ? "bg-[#636366]" : "bg-white"
        } ${checked ? "left-[27px]" : "left-[3px]"}`}
      />
    </div>
  );
}

function SliderTrack({
  value,
  max = 100,
  blue = false,
}: {
  value: number;
  max?: number;
  blue?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="relative h-[3px] w-full rounded-full bg-[#48484a] mt-3">
      <div
        className={`absolute h-full rounded-full ${blue ? "bg-[#4285f4]" : "bg-[#8a8a8e]"}`}
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-white shadow-lg ring-0"
        style={{ left: `calc(${pct}% - 10px)` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// ROW COMPONENTS
// ─────────────────────────────────────────────

function SliderRow({
  label,
  value,
  max = 100,
  focused,
}: {
  label: string;
  value: number;
  max?: number;
  focused?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-5 py-4 ${
        focused ? "bg-[#d4d4d4]" : ""
      }`}
    >
      <div
        className={`flex justify-between text-[15px] font-medium ${
          focused ? "text-black" : "text-white"
        }`}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <SliderTrack value={value} max={max} blue={!focused} />
    </div>
  );
}

function StepperRow({
  label,
  value,
  disabled,
  focused,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  focused?: boolean;
}) {
  const labelColor = disabled
    ? "text-[#4a4a4e]"
    : focused
    ? "text-black"
    : "text-white";
  const valColor = disabled ? "text-[#4a4a4e]" : focused ? "text-black" : "text-[#c8c8c8]";
  const iconColor = disabled ? "text-[#4a4a4e]" : focused ? "text-black" : "text-[#c8c8c8]";
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 rounded-xl ${
        focused ? "bg-[#d4d4d4]" : ""
      }`}
    >
      <span className={`text-[15px] ${labelColor}`}>{label}</span>
      <div className="flex items-center gap-4">
        <ChevronLeft className={`w-[14px] h-[14px] ${iconColor}`} />
        <span className={`text-[15px] min-w-[52px] text-center ${valColor}`}>{value}</span>
        <ChevronRight className={`w-[14px] h-[14px] ${iconColor}`} />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  focused,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  focused?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 rounded-xl ${
        focused ? "bg-[#d4d4d4]" : ""
      }`}
    >
      <span
        className={`text-[15px] ${
          disabled ? "text-[#4a4a4e]" : focused ? "text-black" : "text-white"
        }`}
      >
        {label}
      </span>
      <Toggle checked={checked} disabled={disabled} />
    </div>
  );
}

function NavRow({
  label,
  sublabel,
  focused,
  onClick,
}: {
  label: string;
  sublabel?: string;
  focused?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`px-5 py-4 rounded-xl cursor-pointer transition-colors ${
        focused ? "bg-[#d4d4d4]" : "hover:bg-[#2a2a2c]"
      }`}
      onClick={onClick}
    >
      <div className={`text-[15px] font-medium ${focused ? "text-black" : "text-white"}`}>
        {label}
      </div>
      {sublabel && (
        <div className="text-[13px] text-[#8a8a8e] mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}

function ActionRow({
  label,
  focused,
}: {
  label: string;
  focused?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[15px] font-medium cursor-pointer transition-colors ${
        focused ? "bg-[#d4d4d4] text-black" : "bg-[#2a2a2c] text-white hover:bg-[#333336]"
      }`}
    >
      <RotateCcw className="w-[14px] h-[14px]" />
      {label}
    </button>
  );
}

// Focused item with sub-label (Motion Clarity style)
function InfoRow({
  label,
  sublabel,
  focused,
}: {
  label: string;
  sublabel?: string;
  focused?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 rounded-xl ${focused ? "bg-[#d4d4d4]" : ""}`}
    >
      <div className={`text-[15px] font-semibold ${focused ? "text-black" : "text-white"}`}>
        {label}
      </div>
      {sublabel && (
        <div className={`text-[13px] mt-0.5 ${focused ? "text-[#555]" : "text-[#8a8a8e]"}`}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

// Panel wrapper
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1c1c1e] rounded-2xl p-2 ${className}`}>
      {children}
    </div>
  );
}

// Picture Mode selector row
function PictureModeRow({ value, focused }: { value: string; focused?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 rounded-2xl ${
        focused ? "bg-[#d4d4d4]" : "bg-[#2a2a2c]"
      }`}
    >
      <span className={`text-[15px] font-semibold ${focused ? "text-black" : "text-white"}`}>
        Picture Mode
      </span>
      <div className="flex items-center gap-3">
        <ChevronLeft className={`w-[14px] h-[14px] ${focused ? "text-black" : "text-[#c8c8c8]"}`} />
        <span
          className={`text-[15px] min-w-[130px] text-center truncate ${
            focused ? "text-black" : "text-[#c8c8c8]"
          }`}
        >
          {value}
        </span>
        <ChevronRight className={`w-[14px] h-[14px] ${focused ? "text-black" : "text-[#c8c8c8]"}`} />
      </div>
    </div>
  );
}

// Quick setting tile
function QuickTile({
  icon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  focused?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-5 rounded-2xl cursor-pointer transition-colors ${
        focused
          ? "bg-[#e8e8ec] text-black"
          : "bg-[#2a2a2c] text-white hover:bg-[#333336]"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-[15px] font-medium">{label}</span>
    </div>
  );
}

// Bottom picker bar
function BottomPicker({
  items,
  selectedIndex,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
  onSelect?: (i: number) => void;
}) {
  return (
    <div className="bg-[#1c1c1e]/95 backdrop-blur-sm rounded-2xl px-3 py-2.5 flex gap-1.5">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect?.(i)}
          className={`px-5 py-2 rounded-xl text-[15px] font-medium transition-colors whitespace-nowrap ${
            i === selectedIndex
              ? "bg-[#d4d4d4] text-black"
              : "text-[#8a8a8e] hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

// Preview card
function PreviewCard({
  children,
  description,
  wide = false,
}: {
  children?: React.ReactNode;
  description: string;
  wide?: boolean;
}) {
  return (
    <div className={`bg-[#2a2a2c] rounded-2xl overflow-hidden ${wide ? "w-[300px]" : "w-[220px]"}`}>
      {children && (
        <div className="p-2 pb-0">
          <div className="rounded-xl overflow-hidden">{children}</div>
        </div>
      )}
      <div className="px-4 py-4">
        <p className="text-[#b0b0b4] text-[13px] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Dolby Vision logo mark
import tvPreviewLeaf from "../imports/tv_preview_leaf.png";

function DolbyVisionLogo({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${small ? "scale-75 origin-left" : ""}`}>
      <svg viewBox="0 0 32 18" width="32" height="18" fill="currentColor" className="text-white flex-shrink-0">
        <path d="M2 2h6c3.86 0 7 3.14 7 7s-3.14 7-7 7H2V2zm6 11c2.21 0 4-1.79 4-4s-1.79-4-4-4H5v8h3z" />
        <path d="M30 2h-6c-3.86 0-7 3.14-7 7s3.14 7 7 7h6V2zm-6 11c-2.21 0-4-1.79-4-4s1.79-4 4-4h3v8h-3z" />
      </svg>
      <div className="leading-none">
        <div className="text-white text-[13px] font-bold tracking-widest">DOLBY</div>
        <div className="text-white text-[8px] tracking-[0.22em] mt-[1px]">VISION</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN COMPONENTS
// ─────────────────────────────────────────────

const SCREENS: Screen[] = ["quick", "picture", "brightness", "color", "clarity", "motion"];
const SCREEN_LABELS = ["Quick Settings", "Picture", "Brightness", "Color", "Clarity", "Motion"];

function QuickSettingsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="absolute inset-0 flex items-stretch justify-end">
      {/* Dimmed left area */}
      <div className="flex-1 bg-transparent" />

      {/* Panel */}
      <div className="w-[400px] bg-[#1c1c1e] rounded-l-3xl p-7 flex flex-col gap-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[#8a8a8e] text-sm mb-1">Fri, Dec 12</div>
            <div className="text-white text-4xl font-light tracking-tight">11:57 PM</div>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="w-9 h-9 rounded-full bg-[#2a2a2c] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500" />
          </div>
        </div>

        {/* Tiles grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M3 14c4-4 8-4 12 0s4 4 6 0" /></svg>} label="Screensaver" />
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /><path d="M12 7l-3 3 3 3M9 10h8" /></svg>} label="Inputs" />
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /><circle cx="12" cy="10" r="2.5" /></svg>} label="Display" focused />
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>} label="Sound" />
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" /></svg>} label="Wi-Fi" />
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11L12 23V1L17.5 6.5l-11 11" /></svg>} label="Bluetooth" />
          <QuickTile icon={<svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5" /><path d="M12 7v10M7 9.5h10M9.5 21.5l2.5-6 2.5 6" /></svg>} label="Accessibility" />
        </div>

        {/* Info card */}
        <div className="bg-[#2a2a2c] rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3a3a3c] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            </div>
            <div>
              <div className="text-white text-[13px] font-medium leading-snug">
                Set Up Apple AirPlay and HomeKit
              </div>
              <div className="text-[#8a8a8e] text-[11px] mt-1 leading-relaxed">
                Wirelessly share content with this TV using AirPlay and control this TV using the Home app on your iPhone, iPad, or Mac. You can...
              </div>
            </div>
          </div>
        </div>

        {/* Network status */}
        <div className="flex items-center gap-2 px-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-[#4a4a4e]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" /></svg>
          <span className="text-[#4a4a4e] text-[13px]">No Internet connection</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2c]">
          <span className="text-[#8a8a8e] text-[13px]">Google TV</span>
          <ChevronLeft className="w-4 h-4 text-[#8a8a8e] rotate-180" />
        </div>
      </div>
    </div>
  );
}

function PictureScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="absolute inset-0 flex items-start p-12 gap-8">
      {/* Left column */}
      <div className="w-[360px] flex flex-col">
        <div className="mb-7">
          <DolbyVisionLogo />
        </div>

        <PictureModeRow value="Vision Bright" focused />

        <Panel className="mt-2">
          <NavRow label="Brightness" onClick={() => onNavigate("brightness")} />
          <NavRow label="Color" onClick={() => onNavigate("color")} />
          <NavRow label="Clarity" onClick={() => onNavigate("clarity")} />
          <NavRow label="Motion" onClick={() => onNavigate("motion")} />
          <div className="my-1.5 mx-3 border-t border-[#2a2a2c]" />
          <div className="p-1">
            <ActionRow label="Restore Defaults" />
          </div>
        </Panel>

        <Panel className="mt-2">
          <NavRow label="Apply All Picture Settings" sublabel="Current Input" />
          <NavRow label="Eye Health Protection" />
        </Panel>
      </div>

      {/* Right: preview */}
      <div className="pt-16">
        <PreviewCard
          wide
          description="A viewing mode designed for bright environments, offering vibrant and vivid picture quality."
        >
          <div className="h-[160px] bg-[#1c1c1e] flex items-center justify-center overflow-hidden">
            <img src={tvPreviewLeaf} alt="Dolby Vision Leaf Preview" className="w-full h-full object-cover" />
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}

function BrightnessScreen() {
  return (
    <div className="absolute inset-0 flex items-start p-12 gap-8">
      <div className="w-[480px] flex flex-col">
        <h1 className="text-white text-5xl font-light tracking-tight mb-8">Brightness</h1>

        <Panel>
          <SliderRow label="Brightness" value={100} focused />
        </Panel>

        <div className="mt-1">
          <SliderRow label="Contrast" value={100} />
          <SliderRow label="Black Level" value={50} />
          <StepperRow label="Gamma" value="2.2" />
          <ToggleRow label="Automatic HDR Conversion" checked={false} disabled />
          <StepperRow label="Dynamic Tone Mapping" value="Off" disabled />
          <StepperRow label="Dynamic Contrast" value="Off" disabled />
          <div className="px-5 py-3">
            <div className="flex justify-between">
              <span className="text-[#4a4a4e] text-[15px]">Black Stretch</span>
              <span className="text-[#4a4a4e] text-[15px]">Off</span>
            </div>
            <div className="mt-2">
              <Toggle checked={false} disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-8">
        <PreviewCard
          wide
          description="Adjust the luminance level of the screen."
        >
          <div className="h-[155px] bg-gradient-to-b from-[#87CEEB] via-[#4a8fbf] to-[#1a3a5c] flex items-end justify-around px-3 pb-2">
            {[55, 70, 80, 90, 100, 90, 80, 70, 55].map((h, i) => (
              <div
                key={i}
                className="w-4 rounded-t-sm"
                style={{
                  height: `${h * 0.9}px`,
                  background: `rgba(135, 206, 235, ${0.3 + (h / 100) * 0.5})`,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}

function ColorScreen() {
  return (
    <div className="absolute inset-0 flex items-start p-12 gap-8">
      <div className="w-[360px] flex flex-col">
        <h1 className="text-white text-5xl font-light tracking-tight mb-8">Color</h1>

        <Panel>
          <SliderRow label="Color Saturation" value={50} focused />
        </Panel>

        <div className="mt-1">
          <SliderRow label="Tint" value={50} />
          <ToggleRow label="Dynamic Color" checked={false} disabled />
          <ToggleRow label="Adaptive Color Temperature" checked={false} disabled />
          <div className="px-5 py-4">
            <div className="flex justify-between mb-1">
              <span className="text-white text-[15px]">Color Temperature</span>
              <span className="text-white text-[15px]">5</span>
            </div>
            <SliderTrack value={75} blue={false} />
            <div className="flex justify-between mt-3 text-[#8a8a8e] text-[12px]">
              <span>Cool</span>
              <span>Normal</span>
              <span>Warm</span>
            </div>
          </div>
          <NavRow label="White Balance" />
          <NavRow label="Color Space" sublabel="Native" />
        </div>
      </div>

      {/* Preview */}
      <div className="pt-8">
        <PreviewCard description="Adjust the color saturation of the picture.">
          <div className="h-[130px] flex">
            <div className="flex-1 bg-gradient-to-br from-[#555] to-[#888]" />
            <div className="flex-1 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500" />
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}

function ClarityScreen() {
  return (
    <div className="absolute inset-0 flex items-start p-12 gap-8">
      <div className="w-[360px] flex flex-col">
        <h1 className="text-white text-5xl font-light tracking-tight mb-8">Clarity</h1>

        <Panel>
          <SliderRow label="Sharpness" value={10} max={20} focused />
        </Panel>

        <div className="mt-1">
          <div className="px-5 py-4">
            <div className="flex justify-between mb-1">
              <span className="text-[#4a4a4e] text-[15px]">Digital Noise Reduction</span>
              <span className="text-[#4a4a4e] text-[15px]">Low</span>
            </div>
            <SliderTrack value={25} blue={false} />
          </div>
          <StepperRow label="Noise Reduction" value="Low" disabled />
          <div className="px-5 py-4">
            <div className="flex justify-between mb-1">
              <span className="text-white text-[15px]">Gradation Clear</span>
              <span className="text-white text-[15px]">Low</span>
            </div>
            <SliderTrack value={40} blue />
          </div>
          <ToggleRow label="Super Resolution" checked={true} />
          <ToggleRow label="Precision Detail" checked={true} />
        </div>
      </div>

      {/* Preview */}
      <div className="pt-8">
        <PreviewCard description="Adjust the detail of the picture.">
          <div
            className="h-[130px]"
            style={{
              background: "linear-gradient(135deg, #1a6b3c 0%, #2a9e60 30%, #3dbf78 50%, #2a9e60 70%, #1a6b3c 100%)",
            }}
          />
        </PreviewCard>
      </div>
    </div>
  );
}

function MotionScreen() {
  return (
    <div className="absolute inset-0 flex items-start p-12 gap-8">
      <div className="w-[480px] flex flex-col">
        <h1 className="text-white text-5xl font-light tracking-tight mb-8">Motion</h1>

        <Panel>
          <InfoRow label="Motion Clarity" sublabel="High" focused />
        </Panel>

        <div className="mt-1">
          <ToggleRow label="LED Motion Clear" checked={false} />
          <ToggleRow label="Dynamic Acceleration" checked={true} />
          <ToggleRow label="Game Direct Sync" checked={false} disabled />
        </div>
      </div>

      {/* Preview */}
      <div className="pt-8">
        <PreviewCard
          wide
          description="Intelligently adds motion compensation frames to reduce jitter and drag, making motion pictures look smoother and clearer."
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DESIGN SYSTEM PAGE SECTIONS
// ─────────────────────────────────────────────

function DSSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="text-[#4a4a4e] text-[11px] font-semibold tracking-[0.12em] uppercase mb-4">
        {title}
      </div>
      {children}
    </div>
  );
}

function TokenSwatch({
  hex,
  name,
  variable,
}: {
  hex: string;
  name: string;
  variable: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#1c1c1e] rounded-xl p-3.5">
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 border border-white/[0.06]"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <div className="text-white text-[13px] font-medium truncate">{name}</div>
        <div className="text-[#4a4a4e] text-[11px] font-mono mt-0.5">{hex}</div>
        <div className="text-[#4a4a4e] text-[11px] font-mono">{variable}</div>
      </div>
    </div>
  );
}

const SCREEN_ICONS = [Settings, Monitor, Sun, Palette, Zap, Wind];
const SCREEN_DESCS = [
  "System overlay panel with grid tiles",
  "Dolby Vision picture mode selector",
  "Sliders, steppers, toggles",
  "Saturation & temperature controls",
  "Sharpness, DNR, resolution toggles",
  "Frame interpolation controls",
];

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen | null>(null);
  const [tab, setTab] = useState<Tab>("screens");

  // ── Full-screen TV prototype ──────────────────
  if (screen !== null) {
    const idx = SCREENS.indexOf(screen);

    return (
      <div className="size-full bg-black relative overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {screen === "quick" && <QuickSettingsScreen onNavigate={setScreen} />}
        {screen === "picture" && <PictureScreen onNavigate={setScreen} />}
        {screen === "brightness" && <BrightnessScreen />}
        {screen === "color" && <ColorScreen />}
        {screen === "clarity" && <ClarityScreen />}
        {screen === "motion" && <MotionScreen />}

        {/* Bottom navigation picker */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <BottomPicker
            items={SCREEN_LABELS}
            selectedIndex={idx}
            onSelect={(i) => setScreen(SCREENS[i])}
          />
        </div>

        {/* Back button */}
        <button
          className="absolute top-6 left-6 flex items-center gap-1.5 text-[#4a4a4e] text-[13px] hover:text-white transition-colors"
          onClick={() => setScreen(null)}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Design System
        </button>
      </div>
    );
  }

  // ── Design System Overview ────────────────────
  return (
    <div
      className="size-full bg-black overflow-auto"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-[960px] mx-auto px-10 py-14">

        {/* ── Header ──────────────────────────── */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <DolbyVisionLogo />
            <div className="h-5 w-px bg-[#2a2a2a]" />
            <span className="text-[#4a4a4e] text-[13px]">TV · Overseas Menu · Design System</span>
          </div>
          <h1 className="text-white text-[52px] font-light tracking-tight leading-none mb-4">
            Component Library
          </h1>
          <p className="text-[#8a8a8e] text-base max-w-[520px] leading-relaxed">
            A 10-foot UI design system for overseas TV and OTT menu interfaces. Dark-first,
            remote-navigable, built from production screen captures.
          </p>
        </div>

        {/* ── Tab bar ──────────────────────────── */}
        <div className="flex gap-1 mb-12 bg-[#1c1c1e] rounded-2xl p-1.5 w-fit">
          {(["screens", "components", "tokens"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-[14px] font-medium capitalize transition-all ${
                tab === t
                  ? "bg-[#d4d4d4] text-black shadow-sm"
                  : "text-[#8a8a8e] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB: SCREENS
        ══════════════════════════════════════ */}
        {tab === "screens" && (
          <div>
            <p className="text-[#4a4a4e] text-[13px] mb-6">
              Click any screen to enter the interactive TV prototype.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {SCREENS.map((id, i) => {
                const Icon = SCREEN_ICONS[i];
                return (
                  <button
                    key={id}
                    onClick={() => setScreen(id)}
                    className="bg-[#1c1c1e] rounded-2xl p-5 text-left hover:bg-[#232325] transition-all group border border-transparent hover:border-[#2a2a2c]"
                  >
                    {/* Thumbnail */}
                    <div className="w-full aspect-video bg-black rounded-xl mb-4 flex items-center justify-center border border-[#2a2a2c] overflow-hidden group-hover:border-[#3a3a3c] transition-colors">
                      <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
                        <Icon className="w-7 h-7 text-white" />
                        <span className="text-white text-[10px] font-medium tracking-wide">
                          {SCREEN_LABELS[i].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-white text-[14px] font-medium">{SCREEN_LABELS[i]}</div>
                    <div className="text-[#8a8a8e] text-[12px] mt-1 leading-snug">{SCREEN_DESCS[i]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: COMPONENTS
        ══════════════════════════════════════ */}
        {tab === "components" && (
          <div>

            <DSSection title="Navigation Rows">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[#4a4a4e] text-[11px] mb-2">Default</div>
                  <Panel>
                    <NavRow label="Brightness" />
                    <NavRow label="Color" />
                    <NavRow label="Clarity" />
                  </Panel>
                </div>
                <div>
                  <div className="text-[#4a4a4e] text-[11px] mb-2">Focused</div>
                  <Panel>
                    <NavRow label="Brightness" focused />
                    <NavRow label="Color" />
                    <NavRow label="Apply All" sublabel="Current Input" />
                  </Panel>
                </div>
              </div>
            </DSSection>

            <DSSection title="Slider Rows">
              <Panel>
                <SliderRow label="Brightness" value={100} focused />
                <SliderRow label="Contrast" value={72} />
                <SliderRow label="Black Level" value={50} />
                <SliderRow label="Sharpness" value={10} max={20} />
              </Panel>
            </DSSection>

            <DSSection title="Stepper Rows">
              <Panel>
                <StepperRow label="Gamma" value="2.2" focused />
                <StepperRow label="Noise Reduction" value="Low" />
                <StepperRow label="Dynamic Tone Mapping" value="Off" disabled />
                <StepperRow label="Dynamic Contrast" value="Off" disabled />
              </Panel>
            </DSSection>

            <DSSection title="Toggle Rows">
              <Panel>
                <ToggleRow label="Super Resolution" checked={true} />
                <ToggleRow label="Precision Detail" checked={true} focused />
                <ToggleRow label="LED Motion Clear" checked={false} />
                <ToggleRow label="Dynamic Acceleration" checked={false} />
                <ToggleRow label="Game Direct Sync" checked={false} disabled />
              </Panel>
            </DSSection>

            <DSSection title="Toggle States">
              <div className="flex items-center gap-8 bg-[#1c1c1e] rounded-2xl p-6">
                <div className="text-center">
                  <Toggle checked={true} />
                  <div className="text-[#8a8a8e] text-[11px] mt-2">On</div>
                </div>
                <div className="text-center">
                  <Toggle checked={false} />
                  <div className="text-[#8a8a8e] text-[11px] mt-2">Off</div>
                </div>
                <div className="text-center">
                  <Toggle checked={true} disabled />
                  <div className="text-[#8a8a8e] text-[11px] mt-2">Disabled On</div>
                </div>
                <div className="text-center">
                  <Toggle checked={false} disabled />
                  <div className="text-[#8a8a8e] text-[11px] mt-2">Disabled Off</div>
                </div>
              </div>
            </DSSection>

            <DSSection title="Picture Mode Selector">
              <div className="flex flex-col gap-2">
                <PictureModeRow value="Vision Bright" focused />
                <PictureModeRow value="Vision Dark" />
              </div>
            </DSSection>

            <DSSection title="Quick Setting Tiles">
              <div className="grid grid-cols-4 gap-2.5">
                <QuickTile icon={<Monitor className="w-5 h-5" />} label="Display" focused />
                <QuickTile icon={<Volume2 className="w-5 h-5" />} label="Sound" />
                <QuickTile icon={<Wifi className="w-5 h-5" />} label="Wi-Fi" />
                <QuickTile icon={<Bluetooth className="w-5 h-5" />} label="Bluetooth" />
                <QuickTile icon={<Tv className="w-5 h-5" />} label="Inputs" />
                <QuickTile icon={<Accessibility className="w-5 h-5" />} label="Accessibility" />
              </div>
            </DSSection>

            <DSSection title="Bottom Picker Bar">
              <div className="flex flex-col gap-4">
                <BottomPicker
                  items={["Picture Mode", "Dolby Vision", "Dolby Vision Bright", "Dolby Vision Dark"]}
                  selectedIndex={1}
                />
                <BottomPicker
                  items={SCREEN_LABELS}
                  selectedIndex={2}
                />
              </div>
            </DSSection>

            <DSSection title="Preview Cards">
              <div className="flex gap-4 flex-wrap">
                <PreviewCard
                  description="A viewing mode designed for bright environments, offering vibrant and vivid picture quality."
                >
                  <div className="h-[110px] bg-gradient-to-br from-[#1a4a1a] via-[#2d7a2d] to-[#88cc88]" />
                </PreviewCard>

                <PreviewCard description="Backlight setting is dim at this time, use this mode when home light is dim.">
                  <div className="h-[110px] bg-gradient-to-br from-[#1a1a2e] via-[#2a2a4e] to-[#4a4a8e]" />
                </PreviewCard>

                <PreviewCard description="Adjust the luminance level of the screen." />

                <PreviewCard
                  wide
                  description="Intelligently adds motion compensation frames to reduce jitter and drag, making motion pictures look smoother and clearer."
                />
              </div>
            </DSSection>

            <DSSection title="Action Row">
              <Panel>
                <div className="p-1">
                  <ActionRow label="Restore Defaults" />
                </div>
                <div className="p-1 pt-0">
                  <ActionRow label="Restore Defaults" focused />
                </div>
              </Panel>
            </DSSection>

          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: TOKENS
        ══════════════════════════════════════ */}
        {tab === "tokens" && (
          <div>

            <DSSection title="Color Palette">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { hex: "#000000", name: "Canvas · Background", variable: "--background" },
                  { hex: "#1c1c1e", name: "Panel · Surface", variable: "--card" },
                  { hex: "#2a2a2c", name: "Elevated · Card", variable: "--popover" },
                  { hex: "#333336", name: "Hover · Accent", variable: "--accent" },
                  { hex: "#d4d4d4", name: "Focus · Selected", variable: "--primary" },
                  { hex: "#4285f4", name: "Accent Blue · Interactive", variable: "--secondary" },
                  { hex: "#ffffff", name: "Primary Text", variable: "--foreground" },
                  { hex: "#8a8a8e", name: "Muted Text", variable: "--muted-foreground" },
                  { hex: "#4a4a4e", name: "Disabled Text", variable: "—" },
                  { hex: "#48484a", name: "Toggle Off", variable: "--switch-background" },
                  { hex: "#38383a", name: "Toggle Disabled", variable: "—" },
                  { hex: "rgba(255,255,255,0.08)", name: "Divider · Border", variable: "--border" },
                ].map((t) => (
                  <TokenSwatch key={t.name} {...t} />
                ))}
              </div>
            </DSSection>

            <DSSection title="Typography Scale">
              <div className="bg-[#1c1c1e] rounded-2xl p-8 space-y-5">
                {[
                  { label: "Screen Title", size: "48px", weight: "300 · Light", cls: "text-5xl font-light" },
                  { label: "Section Header", size: "32px", weight: "300 · Light", cls: "text-3xl font-light" },
                  { label: "Menu Item", size: "15px", weight: "500 · Medium", cls: "text-[15px] font-medium" },
                  { label: "Setting Value", size: "15px", weight: "400 · Regular", cls: "text-[15px] font-normal text-[#c8c8c8]" },
                  { label: "Sublabel", size: "13px", weight: "400 · Regular", cls: "text-[13px] text-[#8a8a8e]" },
                  { label: "Disabled Label", size: "15px", weight: "400 · Regular", cls: "text-[15px] text-[#4a4a4e]" },
                  { label: "Caption / Tag", size: "11px", weight: "600 · Semibold", cls: "text-[11px] font-semibold tracking-widest text-[#4a4a4e]" },
                ].map(({ label, size, weight, cls }) => (
                  <div key={label} className="flex items-baseline justify-between gap-4">
                    <span className={cls}>{label}</span>
                    <span className="text-[#3a3a3c] text-[11px] font-mono whitespace-nowrap flex-shrink-0">
                      {size} · {weight}
                    </span>
                  </div>
                ))}
              </div>
            </DSSection>

            <DSSection title="Spacing & Radius">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Screen padding", value: "48px (p-12)" },
                  { name: "Panel radius", value: "16px (rounded-2xl)" },
                  { name: "Row radius", value: "12px (rounded-xl)" },
                  { name: "Row padding", value: "px-5 py-4" },
                  { name: "Panel padding", value: "8px (p-2)" },
                  { name: "Column gap", value: "32px (gap-8)" },
                  { name: "Tile gap", value: "10px (gap-2.5)" },
                  { name: "Slider height", value: "3px track / 20px thumb" },
                  { name: "Toggle size", value: "52 × 28px" },
                ].map(({ name, value }) => (
                  <div key={name} className="bg-[#1c1c1e] rounded-xl p-4">
                    <div className="text-[#8a8a8e] text-[11px] mb-1.5 uppercase tracking-wide">{name}</div>
                    <div className="text-white text-[13px] font-mono">{value}</div>
                  </div>
                ))}
              </div>
            </DSSection>

            <DSSection title="Interaction States">
              <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
                {[
                  { state: "Default", bg: "transparent", text: "#ffffff", desc: "Unfocused menu row on dark surface" },
                  { state: "Focused / Selected", bg: "#d4d4d4", text: "#000000", desc: "D-pad or pointer focus" },
                  { state: "Hover", bg: "#2a2a2c", text: "#ffffff", desc: "Mouse pointer hover" },
                  { state: "Disabled", bg: "transparent", text: "#4a4a4e", desc: "Unavailable in current mode" },
                  { state: "Active / Pressed", bg: "#c0c0c0", text: "#000000", desc: "Momentary press feedback" },
                ].map(({ state, bg, text, desc }) => (
                  <div
                    key={state}
                    className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2c] last:border-0"
                  >
                    <div
                      className="px-5 py-3 rounded-xl text-[14px] font-medium min-w-[180px]"
                      style={{ background: bg || "transparent", color: text }}
                    >
                      {state}
                    </div>
                    <div className="text-[#4a4a4e] text-[12px]">{desc}</div>
                    <div className="font-mono text-[11px] text-[#3a3a3c]">
                      bg {bg === "transparent" ? "none" : bg}
                    </div>
                  </div>
                ))}
              </div>
            </DSSection>

          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#1c1c1e] flex items-center justify-between">
          <DolbyVisionLogo small />
          <span className="text-[#2a2a2c] text-[11px] font-mono">
            TV · Overseas Menu Design System · v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
