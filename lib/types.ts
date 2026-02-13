export interface PageDateData {
  date: string;
}

export interface PhotoSlot {
  id: string;
  alt: string;
  url?: string;
}

export interface PageTextData {
  id: string;
  placeholder: string;
}

export type PageLayout =
  | "full-photo"
  | "photo-text"
  | "text-only"
  | "collage"
  | "polaroid-grid"
  | "journal-spread"
  | "strip-photo"
  | "mood-board"
  | "daily-log"
  | "photo-diary"
  | "ticket-stub"
  | "grid-notes"
  | "scrapbook-messy";

export interface ScrapbookPage {
  id: string;
  layout: PageLayout;
  date: PageDateData;
  photoSlots: PhotoSlot[];
  textBlocks: PageTextData[];
}

export interface ScrapbookSpread {
  id: string;
  leftPage: ScrapbookPage;
  rightPage?: ScrapbookPage;
}

export interface ScrapbookData {
  id?: string;
  title: string;
  spreads: ScrapbookSpread[];
}
