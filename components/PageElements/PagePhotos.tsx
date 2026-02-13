"use client";

import { useState, useRef } from "react";
import { PhotoSlot } from "@/lib/types";

type PhotoVariant = "single" | "grid" | "full";

interface PagePhotosProps {
  slots: PhotoSlot[];
  variant?: PhotoVariant;
  onUpdate?: (id: string, url: string) => void;
}

export default function PagePhotos({ slots, variant = "grid", onUpdate }: PagePhotosProps) {
  const containerClass = {
    single: "grid grid-cols-1 gap-2",
    grid: "grid grid-cols-2 gap-2",
    full: "grid grid-cols-1 gap-0",
  }[variant];

  const slotClass = {
    single: "aspect-4/3 rounded-sm p-3 pb-8", // Extra padding bottom for "caption" area
    grid: "aspect-square rounded-sm p-2 pb-6",
    full: "aspect-3/4 rounded-sm p-3 pb-8",
  }[variant];

  return (
    <div className={containerClass}>
      {slots.map((slot) => (
        <PhotoSlotItem key={slot.id} slot={slot} className={slotClass!} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function PhotoSlotItem({ slot, className, onUpdate }: { slot: PhotoSlot; className: string; onUpdate?: (id: string, url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(slot.url || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      // Import dynamically or assume it's available. 
      // Since we can't easily change imports at the top without affecting the whole file with 'replace_file_content', 
      // we'll assume the user adds the import manually or we rely on a separate update.
      // Actually, I'll use the 'multi_replace' to add the import too.
      // For this block, let's implement the logic assuming 'supabase' is available.
      
      const { supabase } = await import("@/lib/supabase");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scrapbook-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('scrapbook-photos')
        .getPublicUrl(filePath);

      onUpdate?.(slot.id, publicUrl);
      console.log("Uploaded:", publicUrl);

    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed! Check console.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onUpdate?.(slot.id, ""); // Clear in DB
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 group ${className} ${
        preview 
          ? "bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] rotate-1 hover:rotate-0 hover:scale-105 hover:z-10" 
          : "bg-stone-100/50 border-2 border-dashed border-stone-300 hover:border-stone-400"
      }`}
      style={{
           transform: preview ? `rotate(${Math.random() * 4 - 2}deg)` : undefined
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {uploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 rounded-sm">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {preview ? (
        <>
          <img
            src={preview}
            alt={slot.alt}
            className="absolute inset-0 w-full h-full object-contain bg-stone-100/20"
          />
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            &times;
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-5 h-5 text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="text-xs text-stone-400">{slot.alt}</span>
        </div>
      )}
    </div>
  );
}
