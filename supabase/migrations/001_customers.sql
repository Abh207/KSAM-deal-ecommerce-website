create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, phone text, date_of_birth date,
  gender text check (gender in ('female','male','other','prefer_not_to_say')),
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  marketing_opt_in boolean not null default false,
  consent_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null, phone text not null,
  line1 text not null, line2 text, landmark text,
  city text not null, state text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id);
create unique index if not exists one_default_address_per_user on public.addresses(user_id) where is_default;
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger addresses_updated before update on public.addresses for each row execute function public.set_updated_at();
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles (id, email) select id, email from auth.users on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.newsletter_subscribers enable row level security;
create policy "profile select own" on public.profiles for select using (auth.uid() = id);
create policy "profile insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profile update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "address all own" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "newsletter insert any" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;
create policy "avatar public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar insert own" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar update own" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar delete own" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
