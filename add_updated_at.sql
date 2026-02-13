-- Add updated_at column to pages table
alter table pages 
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
