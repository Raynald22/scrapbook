interface BookCoverProps {
  title: string;
  onOpen?: () => void;
}

export default function BookCover({ title, onOpen }: BookCoverProps) {
  return (
    <div onClick={onOpen} className={`cursor-pointer group h-full w-full ${!onOpen ? 'pointer-events-none' : ''}`}>
      <div 
        className="relative h-full w-full rounded-r-lg shadow-2xl flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #c9a882 0%, #b8956e 30%, #a3815a 70%, #c4a074 100%)",
        }}
      >
        {/* Kraft Paper Texture - Layered for Realism */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-multiply pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} 
        />
        {/* Secondary texture layer for grain */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
             style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }}
        />
        {/* Warm vignette */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ boxShadow: "inset 0 0 80px rgba(60, 30, 0, 0.25)" }}
        />

        {/* ═══════ SPIRAL BINDING ═══════ */}
        <div className="absolute inset-y-0 left-0 w-14 z-30 flex flex-col items-center justify-center gap-[22px] pointer-events-none">
            {/* Binding strip shadow */}
            <div className="absolute inset-y-0 left-5 w-[2px] bg-black/10" />
            {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="relative flex items-center justify-center">
                    {/* Punch hole */}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5c3d20] to-[#3e2410] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                    {/* Wire loop (visible half-circle poking out left) */}
                    <div className="absolute left-[-6px] w-8 h-[18px] rounded-t-full border-[3px] border-[#a8a8a8] border-b-0 rotate-90"
                         style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
                    />
                    {/* Wire shine */}
                    <div className="absolute left-[-4px] w-6 h-[14px] rounded-t-full border-t-[2px] border-white/30 rotate-90" />
                </div>
            ))}
        </div>

        {/* ═══════ DECORATIVE STICKERS & ELEMENTS ═══════ */}

        {/* --- Top-left: Washi tape strip (translucent) --- */}
        <div className="absolute top-6 left-12 w-40 h-7 bg-gradient-to-r from-amber-300/70 to-yellow-200/60 rotate-[-8deg] shadow-sm z-10"
             style={{ clipPath: "polygon(1% 5%, 99% 0%, 98% 100%, 0% 95%)" }}
        />

        {/* --- Polaroid Photo (larger, centered-right) --- */}
        <div className="absolute top-10 right-6 w-[170px] z-10 rotate-[5deg] group-hover:rotate-[3deg] group-hover:scale-105 transition-all duration-500">
            <div className="bg-white p-[10px] pb-[45px] shadow-[0_4px_15px_rgba(0,0,0,0.2)] rounded-sm">
                <div className="aspect-square bg-gradient-to-br from-[#8fbc8f] via-[#6b8e59] to-[#2e4600] flex items-center justify-center overflow-hidden relative">
                    {/* Faux landscape photo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d5016] via-[#4a7c28] to-[#87ceeb]" />
                    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#228B22] to-[#32CD32] rounded-t-[50%] scale-x-150" />
                    <div className="absolute bottom-[40%] left-[20%] text-3xl opacity-80">🏔️</div>
                    <div className="absolute bottom-[35%] right-[15%] text-2xl opacity-60">🌲</div>
                    <div className="absolute top-[15%] right-[25%] text-lg opacity-40">☁️</div>
                </div>
                {/* Polaroid caption */}
                <p className="text-center font-hand text-[11px] text-stone-500 mt-2 tracking-wide">memories ♡</p>
            </div>
            {/* Tape holding polaroid */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-rose-200/80 -rotate-1 z-20 shadow-sm"
                 style={{ clipPath: "polygon(2% 0%, 98% 3%, 100% 97%, 0% 100%)" }}
            />
        </div>

        {/* --- Main Handwritten Title (center-left, big & expressive) --- */}
        <div className="absolute top-[28%] left-16 z-10 rotate-[-4deg] max-w-[65%]">
            <h1 className="font-hand text-[3.2rem] leading-[1.1] text-[#2c1810] drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                {title}
            </h1>
        </div>

        {/* --- Decorative dried flowers cluster (bottom-left) --- */}
        <div className="absolute bottom-[15%] left-14 z-10 rotate-[-30deg]">
            <span className="text-5xl drop-shadow-md filter brightness-90">🌾</span>
        </div>
        <div className="absolute bottom-[22%] left-24 z-10 rotate-[15deg]">
            <span className="text-3xl drop-shadow-md opacity-80">🍂</span>
        </div>
        <div className="absolute bottom-[10%] left-20 z-10 rotate-[-10deg]">
            <span className="text-2xl opacity-70">🌿</span>
        </div>

        {/* --- Label maker sticker (bottom-center) --- */}
        <div className="absolute bottom-14 left-1/2 -translate-x-[30%] z-20 rotate-[-1deg]">
            <div className="relative">
                <div className="bg-[#1a1a1a] text-[#f5e6d3] px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] uppercase shadow-lg rounded-sm border border-stone-700">
                    ★ SCRAPBOOK ★
                </div>
                <div className="absolute -bottom-[18px] left-4 bg-[#1a1a1a] text-[#f5e6d3] px-4 py-1.5 font-mono text-[9px] tracking-[0.3em] uppercase shadow-md rounded-sm border border-stone-700">
                    2 0 2 6
                </div>
            </div>
        </div>

        {/* --- Vintage stamp (bottom-right) --- */}
        <div className="absolute bottom-8 right-8 opacity-30 rotate-[15deg] z-10">
            <div className="w-20 h-20 border-[3px] border-dashed border-[#5c3d20] rounded-full flex flex-col items-center justify-center">
                <span className="font-serif text-[8px] font-bold uppercase text-[#5c3d20] tracking-wider">Postal</span>
                <span className="font-serif text-[7px] text-[#5c3d20]">★ ★ ★</span>
                <span className="font-serif text-[8px] font-bold uppercase text-[#5c3d20] tracking-wider">Service</span>
            </div>
        </div>

        {/* --- Heart stickers scatter --- */}
        <div className="absolute top-16 left-[45%] text-lg opacity-40 rotate-12 z-10">💛</div>
        <div className="absolute top-[55%] right-8 text-sm opacity-30 -rotate-12 z-10">💛</div>
        <div className="absolute top-[45%] right-16 text-xs opacity-25 rotate-45 z-10">💛</div>

        {/* --- Washi tape strip (mid-right, vertical) --- */}
        <div className="absolute top-[40%] right-0 w-7 h-28 bg-gradient-to-b from-teal-300/50 to-teal-200/40 rotate-[2deg] z-5"
             style={{ clipPath: "polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)" }}
        />

        {/* --- Corner fold (top-right) --- */}
        <div className="absolute top-0 right-0 w-0 h-0 z-20"
             style={{
               borderStyle: "solid",
               borderWidth: "0 40px 40px 0",
               borderColor: "transparent #8b7355 transparent transparent",
               filter: "drop-shadow(-2px 2px 2px rgba(0,0,0,0.15))"
             }}
        />
        <div className="absolute top-0 right-0 w-0 h-0 z-20"
             style={{
               borderStyle: "solid",
               borderWidth: "0 38px 38px 0",
               borderColor: "transparent #d4c4a8 transparent transparent",
             }}
        />

        {/* --- Airplane sticker --- */}
        <div className="absolute top-4 left-[55%] text-2xl opacity-30 rotate-[30deg] z-10">✈️</div>

        {/* --- Stars scatter --- */}
        <div className="absolute top-[65%] left-[40%] text-lg opacity-20 z-10">✨</div>
        <div className="absolute bottom-[40%] right-[30%] text-sm opacity-15 z-10">✨</div>

        {/* ═══════ BOTTOM EDGE SHADOW ═══════ */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
