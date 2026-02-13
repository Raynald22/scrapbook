"use client";

import { useState } from "react";
import { PageDateData } from "@/lib/types";

type DateVariant = "default" | "accent" | "subtle" | "minimal" | "serif";

interface PageDateProps {
  data: PageDateData;
  variant?: DateVariant;
}

export default function PageDate({ data, variant = "default", onUpdate }: PageDateProps & { onUpdate?: (content: string) => void }) {
  const [value, setValue] = useState(data.date);

  const className = {
    default: "bg-transparent border-0 border-b border-transparent focus:border-stone-300 text-sm font-medium text-stone-500 tracking-wide",
    accent: "bg-transparent border-0 border-b border-transparent focus:border-stone-400 text-xs font-bold uppercase text-stone-600 tracking-widest",
    subtle: "bg-transparent border-0 border-b border-transparent focus:border-stone-200 text-xs text-stone-400 tracking-wide",
    minimal: "bg-transparent border-0 text-xs text-stone-400 font-mono text-right",
    serif: "bg-transparent border-0 text-lg font-serif text-stone-800 italic text-center",
  }[variant];

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => onUpdate?.(e.target.value)}
      className={`${className} w-fit p-0 focus:outline-none transition-colors cursor-text`}
    />
  );
}
