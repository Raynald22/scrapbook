import { ReactElement, useState, Children, cloneElement } from "react";

interface FlipBookProps {
  width: number;
  height: number;
  children: ReactElement[]; // Array of FlipPage components
}

export default function FlipBook({ width, height, children }: FlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Children.count(children);

  const handleFlip = (index: number) => {
    if (index === currentPage) {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    } else if (index === currentPage - 1) {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Touch / Swipe Logic
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe Left -> Next Page
      if (currentPage < totalPages) setCurrentPage(p => p + 1);
    }
    
    if (isRightSwipe) {
      // Swipe Right -> Prev Page
      if (currentPage > 0) setCurrentPage(p => p - 1);
    }
  };

  return (
    <div
      className="relative mx-auto select-none"
      style={{ 
          width: width, 
          height: height,
          perspective: "2500px", // Increased perspective for more drama
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Desktop Navigation Arrows */}
      <div className="absolute top-1/2 -left-24 -translate-y-1/2 hidden md:flex z-50">
        <button 
            onClick={() => currentPage > 0 && setCurrentPage(p => p - 1)}
            disabled={currentPage === 0}
            className={`p-4 rounded-full bg-stone-800/20 hover:bg-stone-800/40 text-stone-600 hover:text-stone-800 transition-all backdrop-blur-sm border border-stone-800/10 ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
      </div>

      <div className="absolute top-1/2 -right-24 -translate-y-1/2 hidden md:flex z-50">
        <button 
            onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className={`p-4 rounded-full bg-stone-800/20 hover:bg-stone-800/40 text-stone-600 hover:text-stone-800 transition-all backdrop-blur-sm border border-stone-800/10 ${currentPage === totalPages ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </button>
      </div>

      {/* Container for the book itself with tilt */}
      <div 
         className="relative w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
         style={{
            transformStyle: "preserve-3d",
            // Dynamic Transition:
            // Closed (0): Flat, slight angle.
            // Open (>0): Tilted up for reading, slightly rotated.
            transform: currentPage === 0 
                ? "rotateX(0deg) rotateY(0deg) translateZ(0px)" 
                : "translateY(10px) translateZ(-20px) rotateX(5deg) rotateZ(-0.5deg) scale(0.95)", // Almost flat, just enough 3D to show thickness
         }}
      >
      
      {/* Pages Container aligned to center */}
      <div 
        className="absolute top-0 left-1/2"
        style={{ 
          width: width / 2, 
          height: height,
        }}
      >
        {Children.map(children, (child, index) => {
          
          let zIndex = 0;
          if (index >= currentPage) {
             zIndex = totalPages - index;
          } else {
             zIndex = index;
          }

          // Stacking Logic:
          // Simulate thickness by offsetting pages in Z-space.
          // Right stack (index >= currentPage): Shifts down (negative Z)
          // Left stack (index < currentPage): Shifts down (negative Z)
          
          const isFlipped = index < currentPage;
          
          // Calculate offset
          // If 10 pages total.
          // Page 0 (Cover) is top of right stack. Offset 0.
          // Page 1 is below. Offset -0.5px.
          
          let zOffset = 0;
          if (!isFlipped) {
             // Right Stack: index 0 is top. index = currentPage is top.
             // offset = (index - currentPage) * -0.5
             zOffset = (index - currentPage) * -0.5;
          } else {
             // Left Stack: index = currentPage - 1 is top.
             // offset = (currentPage - 1 - index) * -0.5
             zOffset = (currentPage - 1 - index) * -0.5;
          }

          return cloneElement(child as ReactElement<any>, Object.assign({}, (child as ReactElement<any>).props, {
            isFlipped: isFlipped,
            zIndex: zIndex,
            onFlip: () => handleFlip(index),
            zOffset: zOffset
          }));
        })}
      </div>
      </div>
    </div>
  );
}
