"use client";

import { PageTextData } from "@/lib/types";
import { useState, useEffect } from "react";

type TextVariant = "default" | "journal" | "prominent" | "plain";

interface PageTextProps {
  blocks: PageTextData[];
  variant?: TextVariant;
}

export default function PageText({ blocks, variant = "default", onUpdate }: PageTextProps & { onUpdate?: (id: string, content: string) => void }) {
  const textareaClass = {
    default: "w-full resize-none rounded-md border border-stone-200 bg-transparent p-3 text-sm leading-relaxed text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 font-sans",
    journal: "w-full resize-none border-0 bg-[linear-gradient(transparent_1.5rem,#e5e5e5_1.5rem)] bg-[length:100%_1.55rem] p-0 px-2 text-xl leading-[1.55rem] text-stone-800 placeholder:text-stone-300 focus:outline-none font-hand tracking-wide translate-y-1", 
    prominent: "w-full resize-none bg-transparent p-4 text-2xl leading-relaxed text-stone-800 placeholder:text-stone-300 focus:outline-none font-display text-center font-bold italic",
    plain: "w-full resize-none bg-transparent p-2 text-sm text-stone-600 font-hand leading-relaxed focus:outline-none",
  }[variant];

  const rowCount = {
    default: 4,
    journal: 6,
    prominent: 8,
    plain: 3,
  }[variant];

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block) => (
        <TextAreaWithState 
            key={block.id} 
            block={block} 
            onUpdate={onUpdate} 
            textareaClass={textareaClass} 
            rowCount={rowCount} 
        />
      ))}
    </div>
  );
}

// Helper component to manage local state for each text block independently
// This prevents cursor jumping and ensures clean updates
function TextAreaWithState({ block, onUpdate, textareaClass, rowCount }: { 
    block: PageTextData, 
    onUpdate?: (id: string, content: string) => void, 
    textareaClass?: string, 
    rowCount?: number 
}) {
    // Initialize with prop, but then manage locally
    const [val, setVal] = useState(block.placeholder);

    // If prop changes externally (e.g. initial load), sync it
    useEffect(() => {
        if (block.placeholder && block.placeholder !== val) {
            setVal(block.placeholder);
        }
    }, [block.placeholder]);

    return (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={(e) => onUpdate?.(block.id, e.target.value)}
          placeholder="Write here..."
          className={textareaClass}
          rows={rowCount}
        />
    );
}
