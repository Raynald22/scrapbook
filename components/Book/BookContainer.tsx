"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ScrapbookData, ScrapbookPage, PageLayout } from "@/lib/types";
import FlipBook from "@/components/Book/FlipBook";
import FlipPage from "@/components/Book/FlipPage";
import BookCover from "@/components/Book/BookCover";
import Page from "@/components/Book/Page";

interface BookContainerProps {
  data: ScrapbookData;
}

export default function BookContainer({ data }: BookContainerProps) {
  // Local state to manage spreads dynamically
  const [bookData, setBookData] = useState<ScrapbookData>(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // All available layouts for random page generation
  const ALL_LAYOUTS: PageLayout[] = [
    "photo-text", "full-photo", "text-only", "collage", "polaroid-grid",
    "journal-spread", "strip-photo", "mood-board", "daily-log",
    "photo-diary", "ticket-stub", "grid-notes", "scrapbook-messy"
  ];

  // Generate photo/text slots appropriate for a given layout
  const getSlotsForLayout = (id: string, layout: PageLayout) => {
    const slots: { photos: ScrapbookPage['photoSlots']; texts: ScrapbookPage['textBlocks'] } = {
      photos: [], texts: []
    };
    switch (layout) {
      case "full-photo":
        slots.photos = [{ id: `${id}-p1`, alt: "Photo" }];
        slots.texts = [{ id: `${id}-t1`, placeholder: "Caption..." }];
        break;
      case "photo-text":
        slots.photos = [{ id: `${id}-p1`, alt: "Photo" }];
        slots.texts = [{ id: `${id}-t1`, placeholder: "Write your story..." }];
        break;
      case "text-only":
        slots.texts = [
          { id: `${id}-t1`, placeholder: "Dear diary..." },
          { id: `${id}-t2`, placeholder: "More thoughts..." }
        ];
        break;
      case "collage":
        slots.photos = [
          { id: `${id}-p1`, alt: "Collage 1" },
          { id: `${id}-p2`, alt: "Collage 2" },
          { id: `${id}-p3`, alt: "Collage 3" },
          { id: `${id}-p4`, alt: "Collage 4" }
        ];
        slots.texts = [{ id: `${id}-t1`, placeholder: "Captions..." }];
        break;
      case "polaroid-grid":
        slots.photos = [
          { id: `${id}-p1`, alt: "Snap 1" },
          { id: `${id}-p2`, alt: "Snap 2" },
          { id: `${id}-p3`, alt: "Snap 3" },
          { id: `${id}-p4`, alt: "Snap 4" }
        ];
        break;
      case "journal-spread":
        slots.photos = [{ id: `${id}-p1`, alt: "Photo" }];
        slots.texts = [
          { id: `${id}-t1`, placeholder: "Today was..." },
          { id: `${id}-t2`, placeholder: "More notes..." }
        ];
        break;
      case "strip-photo":
        slots.photos = [
          { id: `${id}-p1`, alt: "Strip 1" },
          { id: `${id}-p2`, alt: "Strip 2" },
          { id: `${id}-p3`, alt: "Strip 3" }
        ];
        slots.texts = [{ id: `${id}-t1`, placeholder: "Memories..." }];
        break;
      case "mood-board":
        slots.photos = [
          { id: `${id}-p1`, alt: "Mood 1" },
          { id: `${id}-p2`, alt: "Mood 2" }
        ];
        slots.texts = [{ id: `${id}-t1`, placeholder: "Today's mood..." }];
        break;
      case "daily-log":
        slots.photos = [{ id: `${id}-p1`, alt: "Day Photo" }];
        slots.texts = [
          { id: `${id}-t1`, placeholder: "What happened today..." },
          { id: `${id}-t2`, placeholder: "Grateful for..." }
        ];
        break;
      case "photo-diary":
        slots.photos = [
          { id: `${id}-p1`, alt: "Main Photo" },
          { id: `${id}-p2`, alt: "Detail 1" },
          { id: `${id}-p3`, alt: "Detail 2" }
        ];
        slots.texts = [{ id: `${id}-t1`, placeholder: "About this moment..." }];
        break;
      case "ticket-stub":
        slots.photos = [{ id: `${id}-p1`, alt: "Event Photo" }];
        slots.texts = [{ id: `${id}-t1`, placeholder: "The experience was..." }];
        break;
      case "grid-notes":
        slots.photos = [
          { id: `${id}-p1`, alt: "Grid Photo 1" },
          { id: `${id}-p2`, alt: "Grid Photo 2" }
        ];
        slots.texts = [
          { id: `${id}-t1`, placeholder: "Note 1..." },
          { id: `${id}-t2`, placeholder: "Note 2..." },
          { id: `${id}-t3`, placeholder: "Note 3..." }
        ];
        break;
      case "scrapbook-messy":
        slots.photos = [
          { id: `${id}-p1`, alt: "Scrap 1" },
          { id: `${id}-p2`, alt: "Scrap 2" }
        ];
        slots.texts = [{ id: `${id}-t1`, placeholder: "Random thoughts..." }];
        break;
    }
    return slots;
  };

  // Helper to create a random page
  const createRandomPage = (id: string, dateStr: string): ScrapbookPage => {
      const randomLayout = ALL_LAYOUTS[Math.floor(Math.random() * ALL_LAYOUTS.length)];
      const slots = getSlotsForLayout(id, randomLayout);
      return {
          id,
          layout: randomLayout,
          date: { date: dateStr },
          photoSlots: slots.photos,
          textBlocks: slots.texts
      };
  };

  // Handle layout change from user
  const handleLayoutChange = (pageId: string, newLayout: PageLayout) => {
    setBookData(prev => {
      const newSpreads = prev.spreads.map(spread => {
        const updatePage = (p: ScrapbookPage): ScrapbookPage => {
          if (p.id !== pageId) return p;
          const slots = getSlotsForLayout(p.id, newLayout);
          // Keep existing content where possible, extend with new slots
          const photos = slots.photos.map((slot, i) => p.photoSlots[i] || slot);
          const texts = slots.texts.map((block, i) => p.textBlocks[i] || block);
          return { ...p, layout: newLayout, photoSlots: photos, textBlocks: texts };
        };
        return {
          ...spread,
          leftPage: updatePage(spread.leftPage),
          rightPage: spread.rightPage ? updatePage(spread.rightPage) : undefined
        };
      });
      return { ...prev, spreads: newSpreads };
    });
  };

  // Ensure we have a book ID
  const ensureBookExists = async () => {
    if (bookData.id) return bookData.id;

    // Dynamic import to avoid SSR issues
    const { supabase } = await import("@/lib/supabase");

    // Check if we have a stored ID in local storage or something? 
    // For now, let's just create a new book if one doesn't exist in state.
    // In a real app, we'd fetch based on user or slug.
    
    // Check if there is ANY book for this user (or just get the first one)
    const { data: existingBooks } = await supabase.from('books').select('id').limit(1);
    
    if (existingBooks && existingBooks.length > 0) {
        const id = existingBooks[0].id;
        setBookData(prev => ({ ...prev, id }));
        return id;
    }

    // Create new book
    const { data, error } = await supabase
        .from('books')
        .insert({ title: bookData.title })
        .select()
        .single();

    if (error) {
        console.error("Error creating book:", error);
        return null;
    }

    setBookData(prev => ({ ...prev, id: data.id }));
    return data.id;
  };

  const savePage = async (page: ScrapbookPage, isLeft: boolean, bookId: string, order: number) => {
    // Dynamic import to avoid SSR issues
    const { supabase } = await import("@/lib/supabase");
    
    // content JSON
    const content = {
        photoSlots: page.photoSlots,
        textBlocks: page.textBlocks
    };

    const { error } = await supabase
      .from('pages')
      .upsert({
         id: page.id,
         book_id: bookId,
         page_order: order,
         layout: page.layout,
         date_label: page.date.date,
         content: content,
         is_left_page: isLeft,
         updated_at: new Date().toISOString()
      });

    if (error) {
        console.error("Error saving page:", error, page.id);
        return error;
    }
    return null;
  };

  // Ref to track latest book data (fixes race condition between Blur and Click)
  const bookDataRef = useRef(bookData);
  
  // Sync ref with state
  useEffect(() => {
      bookDataRef.current = bookData;
  }, [bookData]);

  const handleSaveAll = async () => {
      setSaveStatus('saving');
      
      // CRITICAL: Wait for any pending onBlur updates to propagate
      // When user clicks "Save", the input blurs. We need to let that state update finish.
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentBookData = bookDataRef.current;
      
      console.log("💾 STARTING SAVE...");
      console.log("Current Book Data State:", JSON.stringify(currentBookData, null, 2));
      
      const bookId = await ensureBookExists();
      if (!bookId) {
          alert("Failed to create/find book. Cannot save.");
          setSaveStatus('idle');
          return;
      }

      const promises = [];
      let pageIndex = 0;

      for (const spread of currentBookData.spreads) {
          if (spread.leftPage) {
              console.log(`Saving Left Page ${spread.leftPage.id}:`, spread.leftPage.textBlocks[0]?.placeholder);
              promises.push(savePage(spread.leftPage, true, bookId, pageIndex++));
          }
          if (spread.rightPage) {
              console.log(`Saving Right Page ${spread.rightPage.id}:`, spread.rightPage.textBlocks[0]?.placeholder);
              promises.push(savePage(spread.rightPage, false, bookId, pageIndex++));
          }
      }

      const results = await Promise.all(promises);
      const errors = results.filter(e => e !== null);

      if (errors.length > 0) {
          console.error("Errors saving book:", errors);
          alert(`Failed to save ${errors.length} pages. Check console for details.`);
          setSaveStatus('idle');
      } else {
          console.log("✅ SAVE COMPLETE");
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      }
  };

  const handleUpdatePage = (pageId: string, type: 'photo' | 'text' | 'date', elementId: string, content: string) => {
      console.log(`🔄 UPDATE RECEIVED: Page=${pageId}, Type=${type}, ID=${elementId}, Content=${content}`);
      
      setBookData(prev => {
          const newSpreads = prev.spreads.map(spread => {
              // Check Left
              if (spread.leftPage.id === pageId) {
                  console.log("   -> FOUND in Left Page");
                  const updatedPage = { ...spread.leftPage };
                  
                  if (type === 'photo') {
                      updatedPage.photoSlots = updatedPage.photoSlots.map(slot => 
                          slot.id === elementId ? { ...slot, url: content } : slot
                      );
                  } else if (type === 'text') {
                      updatedPage.textBlocks = updatedPage.textBlocks.map(block => 
                          block.id === elementId ? { ...block, placeholder: content } : block
                      );
                  } else if (type === 'date') {
                      updatedPage.date = { ...updatedPage.date, date: content };
                  }

                  return { ...spread, leftPage: updatedPage };
              }
              
              // Check Right
              if (spread.rightPage && spread.rightPage.id === pageId) {
                  console.log("   -> FOUND in Right Page");
                  const updatedPage = { ...spread.rightPage };
                  
                  if (type === 'photo') {
                      updatedPage.photoSlots = updatedPage.photoSlots.map(slot => 
                          slot.id === elementId ? { ...slot, url: content } : slot
                      );
                  } else if (type === 'text') {
                      updatedPage.textBlocks = updatedPage.textBlocks.map(block => 
                          block.id === elementId ? { ...block, placeholder: content } : block
                      );
                  } else if (type === 'date') {
                      updatedPage.date = { ...updatedPage.date, date: content };
                  }
                  
                  return { ...spread, rightPage: updatedPage };
              }
              return spread;
          });
          return { ...prev, spreads: newSpreads };
      });
  };

  const handleAddPage = () => {
      setBookData(prev => {
          const newSpreads = [...prev.spreads];
          const nextDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const timestamp = Date.now();

          // Create two random pages for a full new spread
          const leftPage = createRandomPage(`new-left-${timestamp}`, nextDate);
          const rightPage = createRandomPage(`new-right-${timestamp}`, nextDate);

          // Always push a NEW spread to ensure we add "1-2 pages" (a full sheet)
          // This avoids filling an existing half-spread which might be confusing
          newSpreads.push({
              id: `spread-${timestamp}`,
              leftPage: leftPage,
              rightPage: rightPage
          });

          return { ...prev, spreads: newSpreads };
      });
  };

  // We need to map the spreads into "Sheets" for the FlipBook.
  // Sheet 0: Front = Cover, Back = Spread 1 Left
  // Sheet 1: Front = Spread 1 Right, Back = Spread 2 Left
  // ...
  // Sheet N: Front = Spread N Right, Back = Back Cover

  const sheets = useMemo(() => {
    const generatedSheets = [];

    // Sheet 0: Cover / First Left Page
    generatedSheets.push({
      front: (
        <div className="w-full h-full">
            <BookCover title={bookData.title} />
        </div>
      ),
      back: bookData.spreads[0]?.leftPage ? <Page page={bookData.spreads[0].leftPage} onUpdate={handleUpdatePage} onLayoutChange={handleLayoutChange} /> : (
        // Inside Front Cover (Duck Pattern)
        <div className="w-full h-full bg-[#fef9c3] flex items-center justify-center shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: `radial-gradient(#ca8a04 2px, transparent 2px)`, backgroundSize: '20px 20px' }} 
             />
             <div className="text-yellow-800/60 font-hand text-2xl z-10 rotate-[-5deg]"> ~ This book belongs to ~ </div>
             <div className="absolute bottom-10 right-10 text-4xl opacity-50 rotate-12">🦆</div>
        </div>
      ),
      frontClass: "bg-[#d0b49f]", // Kraft paper color for cover
      backClass: "bg-[#fef9c3]"   // Yellow inside front cover
    });

    // Middle Sheets
    for (let i = 0; i < bookData.spreads.length; i++) {
      const currentSpread = bookData.spreads[i];
      const nextSpread = bookData.spreads[i + 1];

      // Front of Sheet i (Right Page of Spread i)
      let frontContent;
      if (currentSpread.rightPage) {
           frontContent = <Page page={currentSpread.rightPage} onUpdate={handleUpdatePage} onLayoutChange={handleLayoutChange} />;
      } else {
           // Empty Right Slot -> Add Page Button
           frontContent = (
               <div className="w-full h-full bg-[#f5ead6] flex items-center justify-center">
                   <button 
                      onClick={handleAddPage}
                      className="group flex flex-col items-center gap-2 p-8 border-4 border-dashed border-stone-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer opacity-60 hover:opacity-100"
                   >
                       <div className="w-16 h-16 rounded-full bg-stone-200 group-hover:bg-orange-200 flex items-center justify-center text-3xl text-stone-500 group-hover:text-orange-600 transition-colors">
                           +
                       </div>
                       <span className="text-stone-400 group-hover:text-orange-600 font-hand text-xl">Add New Page</span>
                   </button>
               </div>
           );
      }

      // Back of Sheet i (Left Page of Spread i+1 OR Add Page if end)
      let backContent;
      if (nextSpread) {
          backContent = <Page page={nextSpread.leftPage} onUpdate={handleUpdatePage} onLayoutChange={handleLayoutChange} />;
      } else {
          // No next spread.
          // If the current spread's right page was full, we need a new place for "Add Page".
          // That place is the Back of this sheet (Left of new potential spread).
          
          if (currentSpread.rightPage) {
             backContent = (
               <div className="w-full h-full bg-[#f5ead6] flex items-center justify-center">
                   <button 
                      onClick={handleAddPage}
                      className="group flex flex-col items-center gap-2 p-8 border-4 border-dashed border-stone-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer opacity-60 hover:opacity-100"
                   >
                       <div className="w-16 h-16 rounded-full bg-stone-200 group-hover:bg-orange-200 flex items-center justify-center text-3xl text-stone-500 group-hover:text-orange-600 transition-colors">
                           +
                       </div>
                       <span className="text-stone-400 group-hover:text-orange-600 font-hand text-xl">Add New Page</span>
                   </button>
               </div>
             );
          } else {
             // The current Front was already "Add Page". 
             // So this Back is just the Book End.
             backContent = (
                 <div className="w-full h-full relative flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
                        boxShadow: "inset 0 0 20px rgba(234, 179, 8, 0.2)"
                    }}
                 >
                    {/* Back Cover Texture */}
                    <div className="absolute inset-0 opacity-10" 
                        style={{ backgroundImage: `radial-gradient(#ca8a04 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
                    />
                    <div className="flex gap-4 opacity-80 animate-bounce">
                        <span className="text-5xl drop-shadow-sm">🦆</span>
                        <span className="text-5xl drop-shadow-sm">🦊</span>
                    </div>
                    <div className="absolute bottom-8 text-yellow-900/40 text-xs tracking-widest uppercase font-bold">
                        The End
                    </div>
                 </div>
             );
          }
      }

      generatedSheets.push({
        front: frontContent,
        back: backContent,
        frontClass: "bg-[#f5ead6]",
        backClass: "bg-[#f5ead6]"
      });

      // Special Case: If we just added "Add Page" to the BACK, we need a final sheet for the Back Cover.
      // Because "Add Page" is effectively a new Left Page.
      // So we need a sheet where Front = (Right of that new spread, empty?) and Back = Back Cover.
      
      if (!nextSpread && currentSpread.rightPage) {
           generatedSheets.push({
               front: <div className="w-full h-full bg-[#f5ead6]" />, // Empty right page after "Add Page"
               back: (
                 <div className="w-full h-full relative flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
                        boxShadow: "inset 0 0 20px rgba(234, 179, 8, 0.2)"
                    }}
                 >
                    {/* Back Cover Texture */}
                    <div className="absolute inset-0 opacity-10" 
                        style={{ backgroundImage: `radial-gradient(#ca8a04 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
                    />
                    <div className="flex gap-4 opacity-80 animate-bounce">
                        <span className="text-5xl drop-shadow-sm">🦆</span>
                        <span className="text-5xl drop-shadow-sm">🦊</span>
                    </div>
                    <div className="absolute bottom-8 text-yellow-900/40 text-xs tracking-widest uppercase font-bold">
                        The End
                    </div>
                 </div>
               ),
               frontClass: "bg-[#f5ead6]",
               backClass: "bg-transparent" // Back cover might have its own background logic
           });
      }
    }

    return generatedSheets;
  }, [bookData]);

  // --- Viewport & Mobile Detection ---
  const [isMobile, setIsMobile] = useState(false);
  const [viewportW, setViewportW] = useState(1050);
  const [viewportH, setViewportH] = useState(700);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setIsMobile(vw < 768);
      setViewportW(vw);
      setViewportH(vh);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // --- Desktop: Compute book dimensions to fill viewport ---
  // Page aspect ratio = 3:4 (width:height)
  // Book = 2 pages side by side = 6:4 = 3:2
  const desktopBookW = viewportW;
  const desktopBookH = viewportH;

  // --- Mobile: Flatten all pages into a linear array ---
  const allPages = useMemo(() => {
    const pages: { content: React.ReactNode; label: string }[] = [];
    
    // Cover
    pages.push({
      content: (
        <div className="w-full h-full">
          <BookCover title={bookData.title} />
        </div>
      ),
      label: 'Cover'
    });

    // All content pages from spreads
    bookData.spreads.forEach((spread) => {
      pages.push({
        content: <Page page={spread.leftPage} onUpdate={handleUpdatePage} onLayoutChange={handleLayoutChange} />,
        label: spread.leftPage.date?.date || 'Page'
      });
      if (spread.rightPage) {
        pages.push({
          content: <Page page={spread.rightPage} onUpdate={handleUpdatePage} onLayoutChange={handleLayoutChange} />,
          label: spread.rightPage.date?.date || 'Page'
        });
      }
    });

    // Add Page button
    pages.push({
      content: (
        <div className="w-full h-full bg-[#f5ead6] flex items-center justify-center">
          <button 
            onClick={handleAddPage}
            className="group flex flex-col items-center gap-3 p-8 border-4 border-dashed border-stone-300 rounded-xl hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-stone-200 group-hover:bg-orange-200 flex items-center justify-center text-3xl text-stone-500 group-hover:text-orange-600 transition-colors">
              +
            </div>
            <span className="text-stone-400 group-hover:text-orange-600 font-hand text-xl">Add New Page</span>
          </button>
        </div>
      ),
      label: '+ Add'
    });

    return pages;
  }, [bookData]);

  // --- Mobile Page Navigation (Ref-based for performance) ---
  const [mobilePageIndex, setMobilePageIndex] = useState(0);
  const [flipState, setFlipState] = useState<'idle' | 'flipping-next' | 'flipping-prev'>('idle');
  const touchRef = useRef({ startX: 0, deltaX: 0, swiping: false });
  const flipRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const handleMobileTouchStart = (e: React.TouchEvent) => {
    if (flipState !== 'idle') return;
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.deltaX = 0;
    touchRef.current.swiping = true;
    
    // Show the flip layer immediately
    if (flipRef.current) {
      flipRef.current.style.display = 'block';
      flipRef.current.style.transition = 'none';
      flipRef.current.style.transform = 'rotateY(0deg)';
    }
    if (shadowRef.current) {
      shadowRef.current.style.display = 'block';
      shadowRef.current.style.opacity = '0';
    }
  };

  const handleMobileTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current.swiping || flipState !== 'idle') return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    touchRef.current.deltaX = delta;
    
    // Directly manipulate DOM — no React re-render
    if (flipRef.current) {
      // Swipe left (next page): rotate from 0 to -180
      // Swipe right (prev page): we'll handle differently  
      const maxSwipe = viewportW * 0.4;
      const ratio = Math.max(-1, Math.min(0, delta / maxSwipe));
      const angle = ratio * 180; // 0 to -180
      flipRef.current.style.transform = `rotateY(${angle}deg)`;
    }
    if (shadowRef.current) {
      const progress = Math.min(1, Math.abs(delta) / (viewportW * 0.4));
      shadowRef.current.style.opacity = String(progress * 0.15);
    }
  };

  const handleMobileTouchEnd = () => {
    if (!touchRef.current.swiping || flipState !== 'idle') return;
    touchRef.current.swiping = false;
    
    const delta = touchRef.current.deltaX;
    const threshold = viewportW * 0.12;
    
    if (delta < -threshold && mobilePageIndex < allPages.length - 1) {
      // Commit flip forward
      setFlipState('flipping-next');
      if (flipRef.current) {
        flipRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        flipRef.current.style.transform = 'rotateY(-180deg)';
      }
      if (shadowRef.current) {
        shadowRef.current.style.transition = 'opacity 0.6s';
        shadowRef.current.style.opacity = '0';
      }
    } else if (delta > threshold && mobilePageIndex > 0) {
      // Commit flip backward  
      setFlipState('flipping-prev');
      if (flipRef.current) {
        flipRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        flipRef.current.style.transform = 'rotateY(-180deg)';
      }
      if (shadowRef.current) {
        shadowRef.current.style.transition = 'opacity 0.6s';
        shadowRef.current.style.opacity = '0';
      }
    } else {
      // Cancel — snap back
      if (flipRef.current) {
        flipRef.current.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
        flipRef.current.style.transform = 'rotateY(0deg)';
      }
      if (shadowRef.current) {
        shadowRef.current.style.transition = 'opacity 0.3s';
        shadowRef.current.style.opacity = '0';
      }
    }
  };

  // Handle flip animation end
  const handleFlipTransitionEnd = () => {
    if (flipState === 'flipping-next') {
      setMobilePageIndex(prev => Math.min(prev + 1, allPages.length - 1));
    } else if (flipState === 'flipping-prev') {
      setMobilePageIndex(prev => Math.max(prev - 1, 0));
    }
    setFlipState('idle');
    if (flipRef.current) {
      flipRef.current.style.display = 'none';
      flipRef.current.style.transition = 'none';
      flipRef.current.style.transform = 'rotateY(0deg)';
    }
    if (shadowRef.current) {
      shadowRef.current.style.display = 'none';
    }
  };

  // Navigate via page dots
  const goToPage = (target: number) => {
    if (flipState !== 'idle' || target === mobilePageIndex) return;
    const direction = target > mobilePageIndex ? 'flipping-next' : 'flipping-prev';
    setFlipState(direction as 'flipping-next' | 'flipping-prev');
    
    // Show flip layer and animate
    if (flipRef.current) {
      flipRef.current.style.display = 'block';
      flipRef.current.style.transition = 'none';
      flipRef.current.style.transform = 'rotateY(0deg)';
      // Force reflow before adding transition
      void flipRef.current.offsetHeight;
      flipRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      flipRef.current.style.transform = 'rotateY(-180deg)';
    }
    if (shadowRef.current) {
      shadowRef.current.style.display = 'block';
      shadowRef.current.style.opacity = '0.1';
      setTimeout(() => {
        if (shadowRef.current) shadowRef.current.style.opacity = '0';
      }, 300);
    }
    
    // Update page after animation
    setTimeout(() => {
      setMobilePageIndex(target);
      setFlipState('idle');
      if (flipRef.current) {
        flipRef.current.style.display = 'none';
        flipRef.current.style.transition = 'none';
        flipRef.current.style.transform = 'rotateY(0deg)';
      }
      if (shadowRef.current) {
        shadowRef.current.style.display = 'none';
      }
    }, 620);
  };

  // ==========================================
  // MOBILE RENDER: Single page with 3D flip
  // ==========================================
  if (isMobile) {
    // Determine what the "flipping page" and "underneath page" show
    const underneathIndex = flipState === 'flipping-next' 
      ? Math.min(mobilePageIndex + 1, allPages.length - 1)
      : flipState === 'flipping-prev'
      ? Math.max(mobilePageIndex - 1, 0)
      : mobilePageIndex;

    return (
      <div className="fixed inset-0 w-screen h-[100dvh] bg-[#f5ead6] overflow-hidden flex flex-col">
        {/* Page Content - Full Screen with 3D perspective */}
        <div 
          className="flex-1 relative overflow-hidden"
          style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
          onTouchStart={handleMobileTouchStart}
          onTouchMove={handleMobileTouchMove}
          onTouchEnd={handleMobileTouchEnd}
        >
          {/* Base layer: shows current page (or the target page during flip) */}
          <div className="absolute inset-0">
            {flipState !== 'idle' 
              ? allPages[underneathIndex]?.content
              : allPages[mobilePageIndex]?.content
            }
          </div>

          {/* Flip layer: the page that visually flips away */}
          <div 
            ref={flipRef}
            className="absolute inset-0 bg-[#f5ead6]"
            style={{
              display: 'none',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
              zIndex: 10,
            }}
            onTransitionEnd={handleFlipTransitionEnd}
          >
            {/* Always shows the current page content (the page being flipped away) */}
            {allPages[mobilePageIndex]?.content}
            {/* Page edge shadow */}
            <div 
              className="absolute top-0 right-0 w-8 h-full pointer-events-none"
              style={{ 
                background: 'linear-gradient(to left, rgba(0,0,0,0.08), transparent)',
              }}
            />
          </div>

          {/* Shadow/fold effect overlay */}
          <div 
            ref={shadowRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              display: 'none',
              background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 40%)',
              zIndex: 20,
              willChange: 'opacity',
            }}
          />
        </div>

        {/* Bottom Navigation Bar */}
        <div className="flex-shrink-0 bg-[#e8dcc8] border-t border-stone-300/50 px-4 py-2 flex items-center justify-between safe-area-bottom">
          {/* Page indicator */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] scrollbar-hide">
            {allPages.map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`rounded-full transition-all duration-200 flex-shrink-0 ${
                  i === mobilePageIndex 
                    ? 'w-6 h-2 bg-orange-500' 
                    : 'w-2 h-2 bg-stone-400/50'
                }`}
              />
            ))}
          </div>

          {/* Page label */}
          <span className="text-stone-500 text-xs font-hand whitespace-nowrap mx-2">
            {mobilePageIndex + 1} / {allPages.length}
          </span>

          {/* Save button */}
          <button
            onClick={handleSaveAll}
            disabled={saveStatus === 'saving'}
            className={`px-3 py-1.5 rounded-full font-hand text-sm shadow transition-all flex-shrink-0 ${
              saveStatus === 'saved' 
                ? "bg-green-100 text-green-700 border border-green-400" 
                : "bg-white text-stone-700 border border-stone-800 hover:bg-stone-50"
            }`}
          >
            {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✨' : '💾 Save'}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DESKTOP RENDER: FlipBook fills viewport
  // ==========================================
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-stone-100 flex items-center justify-center">
      {/* FlipBook fills the entire viewport */}
      <FlipBook width={desktopBookW} height={desktopBookH}>
        {sheets.map((sheet, i) => (
           // @ts-ignore - FlipBook injects props
          <FlipPage 
              key={i} 
              front={sheet.front} 
              back={sheet.back} 
              frontClass={sheet.frontClass} 
              backClass={sheet.backClass}
          />
        ))}
      </FlipBook>

      {/* Floating Save Button */}
      <button
          onClick={handleSaveAll}
          disabled={saveStatus === 'saving'}
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-full font-hand text-xl shadow-xl transition-all hover:scale-105 active:scale-95 ${
              saveStatus === 'saved' 
                  ? "bg-green-100 text-green-700 border-2 border-green-400" 
                  : "bg-white text-stone-700 border-2 border-stone-800 hover:bg-stone-50"
          }`}
      >
          {saveStatus === 'saving' ? (
              <>
                  <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
              </>
          ) : saveStatus === 'saved' ? (
              <span>✨ Saved!</span>
          ) : (
              <span>💾 Save Book</span>
          )}
      </button>
    </div>
  );
}
