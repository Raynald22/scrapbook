import BookContainer from "@/components/Book/BookContainer";
import { scrapbookData } from "@/data/scrapbook";
import { createClient } from "@supabase/supabase-js";
import type { ScrapbookData, ScrapbookPage as ScrapbookPageType, ScrapbookSpread } from "@/lib/types";

export const revalidate = 0; // Disable cache for now

export default async function ScrapbookPage() {

  let book: ScrapbookData = { ...scrapbookData };

  // Guard: only connect to Supabase if env vars exist (avoids build-time crash on Vercel)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase env vars not set. Using default data.");
    return <BookContainer data={book} />;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 1. Fetch the Book (Layout Metadata)
  const { data: books, error: bookError } = await supabase.from('books').select('*').limit(1);
  
  console.log("📚 Fetching Book...");
  if (bookError) console.error("❌ Book Fetch Error:", bookError);
  
  if (books && books.length > 0) {
      const dbBook = books[0];
      console.log("✅ Found Book:", dbBook.id, dbBook.title);
      book.id = dbBook.id;
      book.title = dbBook.title;
  } else {
      console.log("⚠️ No books found in DB.");
  }

  // 2. Fetch Pages
  console.log("📄 Fetching Pages for Book ID:", book.id);
  const { data: pages, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('book_id', book.id || '') // Only if we have a book ID
    .order('page_order', { ascending: true });

  if (pageError) console.error("❌ Page Fetch Error:", pageError);

  if (pages && pages.length > 0) {
      console.log(`✅ Found ${pages.length} pages.`);
      console.log("🧐 Raw Page 1 Content:", JSON.stringify(pages[0].content, null, 2));
      console.log("📅 Raw Page 1 Date:", pages[0].date_label);

      // transform DB pages to ScrapbookPage
      const scrapbookPages: ScrapbookPageType[] = pages.map((p: any) => ({
          id: p.id,
          layout: p.layout,
          date: { date: p.date_label },
          photoSlots: p.content.photoSlots || [],
          textBlocks: p.content.textBlocks || []
      }));

      // Re-construct spreads
      const newSpreads: ScrapbookSpread[] = [];
      
      for (let i = 0; i < scrapbookPages.length; i += 2) {
          const spreadId = `spread-restored-${Math.floor(i / 2)}`;
          const left = scrapbookPages[i];
          const right = scrapbookPages[i + 1];
          
          newSpreads.push({
              id: spreadId,
              leftPage: { ...left, is_left_page: true } as any, // force Type just in case
              rightPage: right ? { ...right, is_left_page: false } as any : undefined
          });
      }
      
      book.spreads = newSpreads;
  } else {
     console.log("⚠️ No pages found. Using default data.");
     // If no pages in DB, use default data but assign the Book ID so future saves work
     if (book.id) {
         book.spreads = scrapbookData.spreads; 
     }
  }

  return <BookContainer data={book} />;
}
