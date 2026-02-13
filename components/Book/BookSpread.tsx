import { ScrapbookSpread } from "@/lib/types";
import Page from "@/components/Book/Page";

interface BookSpreadProps {
  spread: ScrapbookSpread;
}

export default function BookSpread({ spread }: BookSpreadProps) {
  return (
    <section className="grid grid-cols-2 gap-0 shadow-md">
      <Page page={spread.leftPage} />
      {spread.rightPage && <Page page={spread.rightPage} />}
    </section>
  );
}
