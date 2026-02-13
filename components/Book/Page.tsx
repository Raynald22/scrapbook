"use client";
import { useState } from "react";
import { ScrapbookPage, PageLayout } from "@/lib/types";
import PageDate from "@/components/PageElements/PageDate";
import PagePhotos from "@/components/PageElements/PagePhotos";
import PageText from "@/components/PageElements/PageText";

// ═══════════════════════════════════════════════
// All available layouts with display names
// ═══════════════════════════════════════════════
const ALL_LAYOUTS: { value: PageLayout; label: string; icon: string }[] = [
  { value: "photo-text", label: "Photo + Text", icon: "📷" },
  { value: "full-photo", label: "Full Photo", icon: "🖼️" },
  { value: "text-only", label: "Text Only", icon: "📝" },
  { value: "collage", label: "Collage", icon: "🎨" },
  { value: "polaroid-grid", label: "Polaroid Grid", icon: "📸" },
  { value: "journal-spread", label: "Journal Spread", icon: "📖" },
  { value: "strip-photo", label: "Photo Strip", icon: "🎞️" },
  { value: "mood-board", label: "Mood Board", icon: "🌸" },
  { value: "daily-log", label: "Daily Log", icon: "📅" },
  { value: "photo-diary", label: "Photo Diary", icon: "✏️" },
  { value: "ticket-stub", label: "Ticket Stub", icon: "🎫" },
  { value: "grid-notes", label: "Grid Notes", icon: "📐" },
  { value: "scrapbook-messy", label: "Messy Scrapbook", icon: "✂️" },
];

interface PageProps {
  page: ScrapbookPage;
  onUpdate?: (pageId: string, type: 'photo' | 'text' | 'date', id: string, content: string) => void;
  onLayoutChange?: (pageId: string, newLayout: PageLayout) => void;
}

export default function Page({ page, onUpdate, onLayoutChange }: PageProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <article className="flex h-full flex-col overflow-hidden relative group/page">
      {/* Layout Picker Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
        className="absolute top-2 right-2 z-40 w-7 h-7 rounded-full bg-white/80 hover:bg-white border border-stone-200 shadow-sm flex items-center justify-center text-xs opacity-0 group-hover/page:opacity-100 transition-opacity duration-200 cursor-pointer"
        title="Change layout"
      >
        ✏️
      </button>

      {/* Layout Picker Dropdown */}
      {showPicker && (
        <div className="absolute top-10 right-2 z-50 bg-white rounded-lg shadow-xl border border-stone-200 p-1.5 max-h-[300px] overflow-y-auto w-44" onClick={(e) => e.stopPropagation()}>
          <div className="text-[10px] text-stone-400 uppercase tracking-wider px-2 py-1 font-bold">Choose Layout</div>
          {ALL_LAYOUTS.map((layout) => (
            <button
              key={layout.value}
              onClick={(e) => {
                e.stopPropagation();
                onLayoutChange?.(page.id, layout.value);
                setShowPicker(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                page.layout === layout.value
                  ? "bg-amber-100 text-amber-800 font-medium"
                  : "hover:bg-stone-50 text-stone-600"
              }`}
            >
              <span>{layout.icon}</span>
              <span>{layout.label}</span>
              {page.layout === layout.value && <span className="ml-auto text-amber-500">✓</span>}
            </button>
          ))}
        </div>
      )}

      {renderLayout(page, onUpdate)}
    </article>
  );
}

// ═══════════════════════════════════════════════
// Shared decorative utilities
// ═══════════════════════════════════════════════

// Kraft paper page background
const pageBase = "h-full relative overflow-hidden";
const kraftBg = "bg-[#f5ead6]";
const gridPattern = {
  backgroundImage: `linear-gradient(rgba(180,160,130,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,130,0.15) 1px, transparent 1px)`,
  backgroundSize: '20px 20px'
};
const dotPattern = {
  backgroundImage: `radial-gradient(rgba(180,160,130,0.2) 1px, transparent 1px)`,
  backgroundSize: '16px 16px'
};

function WashiTape({ color = "bg-amber-200/70", className = "" }: { color?: string; className?: string }) {
  return (
    <div className={`${color} shadow-sm ${className}`}
         style={{ clipPath: "polygon(2% 0%, 98% 2%, 100% 95%, 96% 100%, 0% 98%, 3% 5%)" }}
    />
  );
}

function Sticker({ emoji, className = "" }: { emoji: string; className?: string }) {
  return <div className={`absolute z-20 drop-shadow-md pointer-events-none select-none ${className}`}>{emoji}</div>;
}

// ═══════════════════════════════════════════════
// Layout Router
// ═══════════════════════════════════════════════

function renderLayout(page: ScrapbookPage, onUpdate?: PageProps['onUpdate']) {
  switch (page.layout) {
    case "full-photo": return <FullPhotoLayout page={page} onUpdate={onUpdate} />;
    case "photo-text": return <PhotoTextLayout page={page} onUpdate={onUpdate} />;
    case "text-only": return <TextOnlyLayout page={page} onUpdate={onUpdate} />;
    case "collage": return <CollageLayout page={page} onUpdate={onUpdate} />;
    case "polaroid-grid": return <PolaroidGridLayout page={page} onUpdate={onUpdate} />;
    case "journal-spread": return <JournalSpreadLayout page={page} onUpdate={onUpdate} />;
    case "strip-photo": return <StripPhotoLayout page={page} onUpdate={onUpdate} />;
    case "mood-board": return <MoodBoardLayout page={page} onUpdate={onUpdate} />;
    case "daily-log": return <DailyLogLayout page={page} onUpdate={onUpdate} />;
    case "photo-diary": return <PhotoDiaryLayout page={page} onUpdate={onUpdate} />;
    case "ticket-stub": return <TicketStubLayout page={page} onUpdate={onUpdate} />;
    case "grid-notes": return <GridNotesLayout page={page} onUpdate={onUpdate} />;
    case "scrapbook-messy": return <ScrapbookMessyLayout page={page} onUpdate={onUpdate} />;
    default: return <PhotoTextLayout page={page} onUpdate={onUpdate} />;
  }
}

type LayoutProps = { page: ScrapbookPage; onUpdate?: PageProps['onUpdate'] };

// ═══════════════════════════════════════════════
// 1. FULL PHOTO LAYOUT
// ═══════════════════════════════════════════════
function FullPhotoLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-5`}>
      <div className="absolute inset-0 pointer-events-none" style={dotPattern} />
      
      <div className="mb-3 text-center z-10">
        <PageDate data={page.date} variant="accent" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center p-2 z-10">
        {page.photoSlots.length > 0 && (
          <div className="relative rotate-1 hover:rotate-0 transition-transform duration-500 w-[90%]">
            <div className="bg-white p-2 pb-10 shadow-lg rounded-sm">
              <PagePhotos slots={page.photoSlots.slice(0, 1)} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
            </div>
            <WashiTape color="bg-rose-200/70" className="absolute -top-2 left-[30%] w-20 h-5 rotate-2 z-20" />
            <Sticker emoji="🌸" className="text-2xl -bottom-3 -right-3 rotate-12" />
          </div>
        )}
      </div>

      {page.textBlocks.length > 0 && (
        <div className="mt-3 z-10">
          <PageText blocks={page.textBlocks.slice(0, 1)} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// 2. PHOTO + TEXT LAYOUT
// ═══════════════════════════════════════════════
function PhotoTextLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-6 gap-4`}>
      <div className="absolute inset-0 pointer-events-none" style={gridPattern} />
      
      <div className="flex justify-between items-end border-b border-amber-300/40 pb-2 z-10">
        <PageDate data={page.date} variant="default" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
        <div className="text-amber-600/60 font-hand text-sm italic">~ memories ~</div>
      </div>

      {page.photoSlots.length > 0 && (
        <div className="relative -rotate-1 hover:rotate-0 transition-transform duration-500 z-10">
          <div className="bg-white p-2 shadow-md rounded-sm">
            <PagePhotos slots={page.photoSlots.slice(0, 1)} variant="single" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
          <WashiTape color="bg-teal-200/60" className="absolute -top-2 -left-2 w-14 h-4 -rotate-12 z-20" />
        </div>
      )}

      {page.textBlocks.length > 0 && (
        <div className="flex-1 min-h-0 z-10 relative">
          <PageText blocks={page.textBlocks} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          <Sticker emoji="🍂" className="text-xl -bottom-1 -right-1 rotate-45 opacity-60" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3. TEXT ONLY LAYOUT
// ═══════════════════════════════════════════════
function TextOnlyLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-8 gap-4`}>
      {/* Lined paper background */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,130,0.25) 28px)", backgroundSize: "100% 28px" }}
      />
      {/* Red margin line */}
      <div className="absolute top-0 bottom-0 left-14 w-[1px] bg-rose-300/40 pointer-events-none" />

      <div className="text-center z-10 mb-2">
        <PageDate data={page.date} variant="subtle" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
        <div className="w-12 h-[2px] bg-amber-400/60 mx-auto mt-1 rounded-full" />
      </div>

      <div className="flex-1 z-10 pl-6">
        <PageText blocks={page.textBlocks} variant="prominent" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
      </div>

      <Sticker emoji="📎" className="text-2xl top-4 right-6 rotate-12 opacity-50" />
      <Sticker emoji="✨" className="text-lg bottom-6 right-8 opacity-30" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 4. COLLAGE LAYOUT
// ═══════════════════════════════════════════════
function CollageLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-4 gap-3`}>
      <div className="absolute inset-0 pointer-events-none" style={dotPattern} />
      
      <div className="text-right z-10">
        <PageDate data={page.date} variant="accent" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
      </div>

      {page.photoSlots.length > 0 && (
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2 z-10">
          {page.photoSlots.map((slot, i) => (
            <div key={slot.id} className={`relative bg-white p-1 shadow-md transform ${['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'][i % 4]}`}>
              <PagePhotos slots={[slot]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
              {i === 0 && <WashiTape color="bg-yellow-200/70" className="absolute -top-1 left-[20%] w-12 h-4 rotate-3 z-20" />}
            </div>
          ))}
        </div>
      )}

      {page.textBlocks.length > 0 && (
        <div className="z-10 bg-white/40 backdrop-blur-sm p-2 rounded border border-amber-200/40 -rotate-1">
          <PageText blocks={page.textBlocks} variant="default" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
        </div>
      )}
      <Sticker emoji="🌻" className="text-2xl -bottom-1 -right-1 rotate-12 opacity-70" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 5. POLAROID GRID LAYOUT
// ═══════════════════════════════════════════════
function PolaroidGridLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-5`}>
      <div className="absolute inset-0 pointer-events-none" style={gridPattern} />
      
      <div className="mb-4 flex justify-between items-center z-10">
        <div className="font-hand text-amber-700/70 text-lg rotate-[-2deg]">Snapshots ✦</div>
        <PageDate data={page.date} variant="minimal" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
      </div>

      <div className="grid grid-cols-2 gap-3 z-10 flex-1">
        {page.photoSlots.map((slot, i) => (
          <div key={slot.id} className={`bg-white p-1.5 pb-6 shadow-md transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:scale-105 transition-transform duration-300`}>
            <div className="w-full aspect-square bg-stone-100 overflow-hidden">
              <PagePhotos slots={[slot]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
            </div>
          </div>
        ))}
      </div>

      <Sticker emoji="💛" className="text-xl bottom-4 left-4 opacity-40" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 6. JOURNAL SPREAD LAYOUT
// ═══════════════════════════════════════════════
function JournalSpreadLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-6`}>
      <div className="absolute inset-0 pointer-events-none" style={gridPattern} />
      <WashiTape color="bg-amber-300/50" className="absolute top-0 left-[10%] w-32 h-6 -rotate-1 z-10" />
      
      <div className="mt-6 mb-4 flex flex-col items-center z-10">
        <PageDate data={page.date} variant="serif" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
        <div className="w-12 h-[2px] bg-amber-400/60 mt-1 rounded-full" />
      </div>

      <div className="flex gap-3 mb-3 z-10">
        {page.photoSlots.length > 0 && (
          <div className="w-1/3 shrink-0 bg-white p-1 pb-4 shadow-md rotate-2 self-start">
            <PagePhotos slots={page.photoSlots.slice(0, 1)} variant="single" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
        )}
        <div className="flex-1">
          <PageText blocks={page.textBlocks.slice(0, 1)} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
        </div>
      </div>
      
      <div className="flex-1 z-10">
        {page.textBlocks.length > 1 && (
          <PageText blocks={page.textBlocks.slice(1)} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
        )}
      </div>

      <Sticker emoji="🌿" className="text-3xl bottom-3 right-3 -rotate-12 opacity-60" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 7. STRIP PHOTO LAYOUT
// ═══════════════════════════════════════════════
function StripPhotoLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-row p-5 gap-4`}>
      <div className="absolute inset-0 pointer-events-none" style={dotPattern} />
      
      <div className="w-2/5 bg-white p-1.5 shadow-xl flex flex-col gap-1.5 -rotate-1 z-10 self-center">
        {page.photoSlots.map(slot => (
          <div key={slot.id} className="aspect-[4/3] bg-stone-100 overflow-hidden">
            <PagePhotos slots={[slot]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
        ))}
        <div className="text-center font-mono text-[10px] text-stone-400 mt-0.5">{page.date.date}</div>
      </div>
      
      <div className="flex-1 flex flex-col z-10 py-2">
        <div className="font-hand text-amber-700/70 text-lg mb-3 rotate-1">Notes ♡</div>
        <PageText blocks={page.textBlocks} variant="plain" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
        <Sticker emoji="🎞️" className="text-2xl bottom-2 right-0 rotate-12 opacity-40" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 8. MOOD BOARD LAYOUT ★ NEW
// ═══════════════════════════════════════════════
function MoodBoardLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} p-4`}>
      <div className="absolute inset-0 pointer-events-none" style={dotPattern} />

      {/* Title banner */}
      <div className="relative z-10 mb-3 text-center">
        <div className="inline-block bg-[#1a1a1a] text-[#f5e6d3] px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase rounded-sm shadow-md -rotate-1">
          ★ mood board ★
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-3 gap-2 z-10 relative" style={{ gridAutoRows: "minmax(60px, auto)" }}>
        {/* Photo 1 - large, spans 2 cols */}
        {page.photoSlots[0] && (
          <div className="col-span-2 row-span-2 bg-white p-1 shadow-md rotate-1 relative">
            <PagePhotos slots={[page.photoSlots[0]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
            <WashiTape color="bg-pink-200/70" className="absolute -top-1.5 left-[25%] w-14 h-4 rotate-2 z-20" />
          </div>
        )}

        {/* Sticker area */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-3xl">🌙</span>
          <span className="font-hand text-[10px] text-amber-700/60">dreamy</span>
        </div>

        {/* Photo 2 - small */}
        {page.photoSlots[1] && (
          <div className="bg-white p-1 shadow-sm -rotate-2 relative">
            <PagePhotos slots={[page.photoSlots[1]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
        )}

        {/* Text area */}
        <div className="col-span-2 z-10 bg-white/30 p-2 rounded border border-amber-200/30">
          {page.textBlocks.length > 0 && (
            <PageText blocks={page.textBlocks.slice(0, 1)} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          )}
        </div>

        {/* Sticker */}
        <div className="flex items-center justify-center">
          <span className="text-2xl opacity-60">🌸</span>
        </div>
      </div>

      <div className="mt-2 text-center z-10 relative">
        <PageDate data={page.date} variant="minimal" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
      </div>

      <Sticker emoji="✨" className="text-lg top-3 right-3 opacity-30" />
      <Sticker emoji="🦋" className="text-xl bottom-3 left-3 opacity-40 -rotate-12" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 9. DAILY LOG LAYOUT ★ NEW
// ═══════════════════════════════════════════════
function DailyLogLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-6`}>
      {/* Lined paper */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 25px, rgba(180,160,130,0.2) 26px)", backgroundSize: "100% 26px" }}
      />
      <div className="absolute top-0 bottom-0 left-14 w-[1px] bg-rose-300/30 pointer-events-none" />

      {/* Date header */}
      <div className="z-10 mb-3 flex items-center gap-3">
        <div className="bg-amber-800/80 text-white px-3 py-1 rounded-sm font-mono text-[11px] shadow-sm">
          <PageDate data={page.date} variant="minimal" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
        </div>
        <div className="flex-1 h-[1px] bg-amber-400/30" />
      </div>

      {/* Mood indicator */}
      <div className="z-10 mb-3 flex items-center gap-2 pl-6">
        <span className="font-hand text-xs text-amber-700/50 uppercase tracking-wider">mood:</span>
        <div className="flex gap-1">
          {["😊", "😌", "🥰", "😴", "🤔"].map((e, i) => (
            <span key={i} className={`text-sm ${i === 0 ? 'opacity-100 scale-125' : 'opacity-30'} transition-all cursor-pointer hover:opacity-100 hover:scale-125`}>{e}</span>
          ))}
        </div>
      </div>

      {/* Photo (small, inline) */}
      {page.photoSlots.length > 0 && (
        <div className="z-10 mb-3 pl-6 flex gap-3">
          <div className="w-24 bg-white p-1 pb-3 shadow-md rotate-2 shrink-0">
            <PagePhotos slots={page.photoSlots.slice(0, 1)} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
          <WashiTape color="bg-teal-200/50" className="absolute left-[45%] top-[30%] w-6 h-20 rotate-[85deg] z-20" />
        </div>
      )}

      {/* Text blocks */}
      <div className="flex-1 z-10 pl-6">
        <PageText blocks={page.textBlocks} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
      </div>

      <Sticker emoji="☕" className="text-2xl bottom-3 right-4 rotate-6 opacity-50" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 10. PHOTO DIARY LAYOUT ★ NEW
// ═══════════════════════════════════════════════
function PhotoDiaryLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-5`}>
      <div className="absolute inset-0 pointer-events-none" style={gridPattern} />

      {/* Header strip */}
      <div className="z-10 mb-3 flex items-center justify-between">
        <PageDate data={page.date} variant="accent" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
        <div className="flex gap-1">
          {["🏷️"].map((e, i) => <span key={i} className="text-lg opacity-40">{e}</span>)}
        </div>
      </div>

      {/* Main photo - landscape */}
      {page.photoSlots[0] && (
        <div className="z-10 relative mb-3">
          <div className="bg-white p-1.5 shadow-lg rounded-sm">
            <div className="aspect-[16/9] overflow-hidden bg-stone-100">
              <PagePhotos slots={[page.photoSlots[0]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
            </div>
          </div>
          <WashiTape color="bg-yellow-200/60" className="absolute -top-1.5 right-[15%] w-16 h-4 rotate-3 z-20" />
          <WashiTape color="bg-rose-200/50" className="absolute -bottom-1.5 left-[10%] w-12 h-4 -rotate-2 z-20" />
        </div>
      )}

      {/* Secondary photos row */}
      {page.photoSlots.length > 1 && (
        <div className="z-10 flex gap-2 mb-3">
          {page.photoSlots.slice(1).map((slot, i) => (
            <div key={slot.id} className={`flex-1 bg-white p-1 shadow-sm ${i % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
              <div className="aspect-square overflow-hidden bg-stone-100">
                <PagePhotos slots={[slot]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journal text */}
      <div className="flex-1 z-10">
        <PageText blocks={page.textBlocks} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
      </div>

      <Sticker emoji="📌" className="text-xl top-3 left-3 -rotate-12 opacity-40" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 11. TICKET STUB LAYOUT ★ NEW
// ═══════════════════════════════════════════════
function TicketStubLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-5 gap-3`}>
      <div className="absolute inset-0 pointer-events-none" style={dotPattern} />

      {/* Ticket header */}
      <div className="z-10 bg-amber-800/90 text-white p-3 rounded-sm shadow-md relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
        <div className="flex justify-between items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">admit one</div>
            <PageDate data={page.date} variant="minimal" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
          </div>
          <div className="text-3xl opacity-60">🎫</div>
        </div>
        {/* Perforation line */}
        <div className="absolute right-8 top-0 bottom-0 w-[1px] border-l border-dashed border-white/30" />
      </div>

      {/* Photo */}
      {page.photoSlots.length > 0 && (
        <div className="z-10 relative">
          <div className="bg-white p-1.5 shadow-md -rotate-1">
            <PagePhotos slots={page.photoSlots.slice(0, 1)} variant="single" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
          <WashiTape color="bg-amber-200/70" className="absolute -top-1.5 left-[40%] w-14 h-4 rotate-1 z-20" />
        </div>
      )}

      {/* Journal */}
      <div className="flex-1 z-10 bg-white/30 p-3 rounded border border-amber-200/30">
        <PageText blocks={page.textBlocks} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
      </div>

      <Sticker emoji="⭐" className="text-xl bottom-2 right-3 opacity-40 rotate-12" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 12. GRID NOTES LAYOUT ★ NEW
// ═══════════════════════════════════════════════
function GridNotesLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} flex flex-col p-5`}>
      <div className="absolute inset-0 pointer-events-none" style={gridPattern} />

      <div className="z-10 mb-3">
        <PageDate data={page.date} variant="default" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
      </div>

      {/* Grid layout of content blocks */}
      <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2 z-10">
        {/* Photo block */}
        {page.photoSlots[0] && (
          <div className="row-span-2 bg-white p-1 shadow-sm rotate-1 relative">
            <PagePhotos slots={[page.photoSlots[0]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
            <WashiTape color="bg-blue-200/60" className="absolute -top-1 left-[20%] w-10 h-3 rotate-3 z-20" />
          </div>
        )}

        {/* Text block 1 */}
        <div className="bg-white/40 p-2 rounded border border-amber-200/40">
          {page.textBlocks[0] && (
            <PageText blocks={[page.textBlocks[0]]} variant="default" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          )}
        </div>

        {/* Sticker area */}
        <div className="flex items-center justify-center bg-white/20 rounded border border-dashed border-amber-200/30">
          <div className="text-center">
            <span className="text-3xl block">📐</span>
            <span className="font-hand text-[10px] text-amber-700/40">notes</span>
          </div>
        </div>

        {/* Photo 2 or text 2 */}
        {page.photoSlots[1] ? (
          <div className="bg-white p-1 shadow-sm -rotate-1">
            <PagePhotos slots={[page.photoSlots[1]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
        ) : page.textBlocks[1] ? (
          <div className="bg-white/40 p-2 rounded border border-amber-200/40">
            <PageText blocks={[page.textBlocks[1]]} variant="default" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          </div>
        ) : (
          <div className="bg-white/20 rounded border border-dashed border-amber-200/30" />
        )}

        {/* Bottom text area */}
        <div className="col-span-2 bg-white/40 p-2 rounded border border-amber-200/40">
          {page.textBlocks.length > 2 ? (
            <PageText blocks={page.textBlocks.slice(2)} variant="default" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          ) : (
            <PageText blocks={page.textBlocks.slice(-1)} variant="default" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          )}
        </div>
      </div>

      <Sticker emoji="📎" className="text-xl top-3 right-4 rotate-12 opacity-40" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 13. SCRAPBOOK MESSY LAYOUT ★ NEW
// ═══════════════════════════════════════════════
function ScrapbookMessyLayout({ page, onUpdate }: LayoutProps) {
  return (
    <div className={`${pageBase} ${kraftBg} p-4 relative`}>
      <div className="absolute inset-0 pointer-events-none" style={dotPattern} />

      {/* Scattered washi tapes */}
      <WashiTape color="bg-pink-200/60" className="absolute top-3 left-[5%] w-28 h-5 -rotate-6 z-10" />
      <WashiTape color="bg-teal-200/50" className="absolute bottom-[15%] right-0 w-6 h-24 rotate-[82deg] z-10" />

      {/* Date - handwritten style, irregular placement */}
      <div className="absolute top-4 right-6 z-20 rotate-3">
        <PageDate data={page.date} variant="accent" onUpdate={(val) => onUpdate?.(page.id, 'date', 'date', val)} />
      </div>

      {/* Main photo - tilted */}
      {page.photoSlots[0] && (
        <div className="absolute top-12 left-4 w-[55%] z-10 -rotate-3">
          <div className="bg-white p-1.5 pb-8 shadow-lg rounded-sm relative">
            <PagePhotos slots={[page.photoSlots[0]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
            <WashiTape color="bg-amber-200/70" className="absolute -top-2 left-[30%] w-16 h-4 rotate-5 z-20" />
          </div>
        </div>
      )}

      {/* Second photo - overlapping */}
      {page.photoSlots[1] && (
        <div className="absolute top-[35%] right-4 w-[40%] z-15 rotate-5">
          <div className="bg-white p-1 pb-5 shadow-md rounded-sm">
            <PagePhotos slots={[page.photoSlots[1]]} variant="full" onUpdate={(id, url) => onUpdate?.(page.id, 'photo', id, url)} />
          </div>
        </div>
      )}

      {/* Text block - sticky note style */}
      {page.textBlocks.length > 0 && (
        <div className="absolute bottom-6 left-3 w-[60%] z-20 rotate-2">
          <div className="bg-amber-50 p-3 shadow-md border-l-4 border-amber-400">
            <PageText blocks={page.textBlocks.slice(0, 1)} variant="journal" onUpdate={(id, val) => onUpdate?.(page.id, 'text', id, val)} />
          </div>
        </div>
      )}

      {/* Scattered stickers */}
      <Sticker emoji="🌸" className="text-xl top-[60%] left-[55%] -rotate-12 opacity-50" />
      <Sticker emoji="🍂" className="text-lg bottom-4 right-6 rotate-45 opacity-40" />
      <Sticker emoji="💫" className="text-sm top-8 left-[60%] opacity-30" />
      <Sticker emoji="🎀" className="text-lg bottom-[40%] right-3 rotate-12 opacity-50" />
    </div>
  );
}
