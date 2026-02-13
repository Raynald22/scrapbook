"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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

  // Dimensions
  // Page Aspect Ratio is 3:4.
  // Let height = 700px. Page Width = 525px.
  // Total Width = 1050px.
  const bookHeight = 700;
  const bookWidth = 1050;

  // Dynamic scale calculation for responsiveness
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Leave some padding around the book
      const paddingX = vw < 640 ? 20 : 80; // Less padding on mobile
      const paddingY = vw < 640 ? 120 : 160; // Space for UI elements
      
      const scaleX = (vw - paddingX) / bookWidth;
      const scaleY = (vh - paddingY) / bookHeight;
      
      const newScale = Math.min(scaleX, scaleY, 1); // Never exceed 1
      setScale(Math.max(newScale, 0.25)); // Never go below 0.25
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] w-full overflow-hidden relative">
      {/* Book Container - dynamically scaled */}
      <div 
        className="transition-transform duration-300 origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        <FlipBook width={bookWidth} height={bookHeight}>
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
      </div>

      {/* Hint Text */}
      <p className="mt-4 sm:mt-6 text-stone-500 text-xs sm:text-sm animate-pulse select-none">
        {scale < 0.5 ? 'Swipe to flip' : 'Click pages to flip'}
      </p>

      {/* Floating Save Button - responsive sizing */}
      <button
          onClick={handleSaveAll}
          disabled={saveStatus === 'saving'}
          className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-hand text-base sm:text-xl shadow-xl transition-all hover:scale-105 active:scale-95 ${
              saveStatus === 'saved' 
                  ? "bg-green-100 text-green-700 border-2 border-green-400" 
                  : "bg-white text-stone-700 border-2 border-stone-800 hover:bg-stone-50"
          }`}
      >
          {saveStatus === 'saving' ? (
              <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Saving...</span>
              </>
          ) : saveStatus === 'saved' ? (
              <>
                  <span>✨ Saved!</span>
              </>
          ) : (
              <>
                  <span>💾 Save Book</span>
              </>
          )}
      </button>
    </div>
  );
}
