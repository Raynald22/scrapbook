import { ReactNode } from "react";

interface FlipPageProps {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  zIndex: number;
  onFlip?: () => void;
  zOffset?: number; // New prop for stacking
  frontClass?: string; // Custom background class for front
  backClass?: string; // Custom background class for back
}

export default function FlipPage({
  front,
  back,
  isFlipped,
  zIndex,
  onFlip,
  zOffset = 0,
  frontClass = "bg-[#f5ead6]",
  backClass = "bg-[#f5ead6]",
}: FlipPageProps) {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full text-stone-800"
      style={{
        perspective: "2000px",
        zIndex: zIndex,
        pointerEvents: "none", // Allow clicks to pass through wrapper to container
        transform: `translateZ(${zOffset}px)`, // Apply stack offset
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.15,0.45,0.25,1)]"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "left center",
          transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
          pointerEvents: "auto", // Re-enable pointer events for the page itself
        }}
      >
        {/* Front Side - displayed when page is on the right */}
        <div
          className={`absolute inset-0 w-full h-full ${frontClass} overflow-hidden rounded-r-md shadow-inner border-l border-stone-200/50`}
          style={{
            backfaceVisibility: "hidden",
            // Realistic paper texture
            backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(255,255,255,0) 5%, rgba(255,255,255,0) 100%)",
          }}
        >
          {/* Dynamic Shadow Overlay when flipping */}
          <div 
            className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-1000"
            style={{ opacity: isFlipped ? 1 : 0 }} 
          />
          {/* Thickness (Right edge) */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#e3dac9]"
            style={{
                transform: "rotateY(90deg) translateX(1.5px)",
                transformOrigin: "right center"
            }}
          />

          {front}
          {/* Paper sheen/highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-100/20 to-transparent pointer-events-none" />
        </div>

        {/* Back Side - displayed when page is on the left */}
        <div
          className={`absolute inset-0 w-full h-full ${backClass} overflow-hidden rounded-l-md shadow-inner border-r border-stone-200/50`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            // Realistic paper texture
            backgroundImage: "linear-gradient(to left, rgba(0,0,0,0.05) 0%, rgba(255,255,255,0) 5%, rgba(255,255,255,0) 100%)",
          }}
        >
          {/* Dynamic Shadow Overlay when flipping */}
          <div 
            className="absolute inset-0 bg-black/10 pointer-events-none transition-opacity duration-1000"
            style={{ opacity: !isFlipped ? 1 : 0 }} 
          />

           {/* Thickness (Left edge) - technically right edge when flipped */}
           <div 
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e3dac9]"
            style={{
                transform: "rotateY(-90deg) translateX(-1.5px)",
                transformOrigin: "left center"
            }}
          />

          {back}
          <div className="absolute inset-0 bg-gradient-to-l from-stone-100/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
