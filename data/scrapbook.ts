import { ScrapbookData } from "@/lib/types";

export const scrapbookData: ScrapbookData = {
  title: "Book of Journeys",
  spreads: [
    {
      id: "spread-1",
      leftPage: {
        id: "page-1",
        layout: "photo-text",
        date: { date: "1 Januari 2026" },
        photoSlots: [
          { id: "p1-photo-1", alt: "Foto kenangan pertama" },
        ],
        textBlocks: [
          { id: "p1-text-1", placeholder: "Tulis ceritamu di sini..." },
        ],
      },
      rightPage: {
        id: "page-2",
        layout: "collage",
        date: { date: "2 Januari 2026" },
        photoSlots: [
          { id: "p2-photo-1", alt: "Foto pertama" },
          { id: "p2-photo-2", alt: "Foto kedua" },
        ],
        textBlocks: [
          { id: "p2-text-1", placeholder: "Catatan hari ini..." },
        ],
      },
    },
    {
      id: "spread-2",
      leftPage: {
        id: "page-3",
        layout: "text-only",
        date: { date: "3 Januari 2026" },
        photoSlots: [],
        textBlocks: [
          { id: "p3-text-1", placeholder: "Refleksi minggu ini..." },
          { id: "p3-text-2", placeholder: "Hal yang disyukuri..." },
        ],
      },
      rightPage: {
        id: "page-4",
        layout: "full-photo",
        date: { date: "4 Januari 2026" },
        photoSlots: [
          { id: "p4-photo-1", alt: "Foto halaman penuh" },
        ],
        textBlocks: [],
      },
    },
  ],
};
