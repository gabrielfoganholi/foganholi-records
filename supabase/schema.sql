-- Foganholi Records — schema do Supabase
-- Rode este arquivo inteiro em Supabase > SQL Editor > New query > Run

create extension if not exists "uuid-ossp";

-- Tabela principal da coleção
create table if not exists public.discs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text not null,
  year integer,
  genre text,
  format text not null check (format in ('Vinil', 'CD')),
  label text,
  catalog_number text,
  cover_url text,
  tracklist jsonb,
  discogs_id bigint,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Lista de desejos
create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text not null,
  year integer,
  genre text,
  format text not null check (format in ('Vinil', 'CD')),
  cover_url text,
  tracklist jsonb,
  discogs_id bigint,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Campos de colecionador (condição, avaliação, favoritos, valores, local de guarda).
-- Uso "add column if not exists" para que rodar este script de novo em um projeto
-- já existente apenas adicione o que falta, sem apagar nada.
alter table public.discs add column if not exists media_condition text;
alter table public.discs add column if not exists sleeve_condition text;
alter table public.discs add column if not exists rating smallint check (rating between 1 and 5);
alter table public.discs add column if not exists favorite boolean not null default false;
alter table public.discs add column if not exists special_edition text;
alter table public.discs add column if not exists storage_location text;
alter table public.discs add column if not exists purchase_price numeric(10,2);
alter table public.discs add column if not exists purchase_place text;
alter table public.discs add column if not exists purchase_date date;
alter table public.discs add column if not exists estimated_value numeric(10,2);

alter table public.wishlist add column if not exists priority text default 'Média';
alter table public.wishlist add column if not exists max_price numeric(10,2);

create index if not exists discs_artist_idx on public.discs (artist);
create index if not exists discs_genre_idx on public.discs (genre);
create index if not exists discs_favorite_idx on public.discs (favorite);
create index if not exists wishlist_artist_idx on public.wishlist (artist);

-- Row Level Security: qualquer usuário autenticado (você e seu pai)
-- pode ler e escrever em toda a coleção, já que é um acervo compartilhado.
alter table public.discs enable row level security;
alter table public.wishlist enable row level security;

drop policy if exists "discs_select_authenticated" on public.discs;
create policy "discs_select_authenticated" on public.discs
  for select to authenticated using (true);

drop policy if exists "discs_insert_authenticated" on public.discs;
create policy "discs_insert_authenticated" on public.discs
  for insert to authenticated with check (true);

drop policy if exists "discs_update_authenticated" on public.discs;
create policy "discs_update_authenticated" on public.discs
  for update to authenticated using (true);

drop policy if exists "discs_delete_authenticated" on public.discs;
create policy "discs_delete_authenticated" on public.discs
  for delete to authenticated using (true);

drop policy if exists "wishlist_select_authenticated" on public.wishlist;
create policy "wishlist_select_authenticated" on public.wishlist
  for select to authenticated using (true);

drop policy if exists "wishlist_insert_authenticated" on public.wishlist;
create policy "wishlist_insert_authenticated" on public.wishlist
  for insert to authenticated with check (true);

drop policy if exists "wishlist_update_authenticated" on public.wishlist;
create policy "wishlist_update_authenticated" on public.wishlist
  for update to authenticated using (true);

drop policy if exists "wishlist_delete_authenticated" on public.wishlist;
create policy "wishlist_delete_authenticated" on public.wishlist
  for delete to authenticated using (true);

-- Bucket de armazenamento para as fotos de capa
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "covers_authenticated_insert" on storage.objects;
create policy "covers_authenticated_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers');

drop policy if exists "covers_authenticated_update" on storage.objects;
create policy "covers_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'covers');

drop policy if exists "covers_authenticated_delete" on storage.objects;
create policy "covers_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'covers');
