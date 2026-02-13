-- Create a policy to allow anyone to PERFORM ALL ACTIONS on the bucket 'scrapbook-photos'
create policy "Allow All Public"
on storage.objects for all
using ( bucket_id = 'scrapbook-photos' )
with check ( bucket_id = 'scrapbook-photos' );
