-- Enable RLS on tables (if not already)
alter table books enable row level security;
alter table pages enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public Access Books" on books;
drop policy if exists "Public Access Pages" on pages;
drop policy if exists "Allow anonymous access" on books;
drop policy if exists "Allow anonymous access" on pages;

-- Create permissive policies for Books
create policy "Enable access to all users"
on books for all
using (true)
with check (true);

-- Create permissive policies for Pages
create policy "Enable access to all users"
on pages for all
using (true)
with check (true);
