-- Create Books Table
create table books (
  id uuid default gen_random_uuid() primary key,
  title text default 'My Scrapbook',
  user_id uuid references auth.users, -- Optional: link to auth user if enabled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Pages Table
create table pages (
  id text primary key, -- Using text ID to match our current "layout-id" or generate UUIDs
  book_id uuid references books on delete cascade,
  layout text not null check (layout in ('photo-text', 'full-photo', 'text-only', 'collage', 'polaroid-grid', 'journal-spread', 'strip-photo')),
  date_label text, -- Stores the formatted date string "14 Februari 2026"
  content jsonb default '{}'::jsonb, -- Stores { photoSlots: [], textBlocks: [] }
  is_left_page boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - Optional for now but good practice
alter table books enable row level security;
alter table pages enable row level security;

-- Policy: Allow public read/write for now (Prototype Mode)
create policy "Public Access Books" on books for all using (true) with check (true);
create policy "Public Access Pages" on pages for all using (true) with check (true);

-- Storage bucket setup (You usually do this in UI, but here is the concept)
-- Bucket: scrapbook-photos
