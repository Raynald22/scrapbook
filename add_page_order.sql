-- Add page_order column to pages table
alter table pages 
add column if not exists page_order integer default 0;
