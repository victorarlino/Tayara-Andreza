create extension if not exists pgcrypto;

create table if not exists public.pessoa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text,
  nascimento text,
  pais text default 'Brasil',
  estado text,
  cidade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fan_clubes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoa(id) on delete cascade,
  nome text not null,
  url text,
  data_fundacao text,
  estado text,
  cidade text,
  instagram_url text not null,
  tiktok_url text not null,
  descricao text,
  status text not null default 'em_analise',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pessoa_email on public.pessoa(email);
create index if not exists idx_fan_clubes_pessoa_id on public.fan_clubes(pessoa_id);

alter table public.pessoa enable row level security;
alter table public.fan_clubes enable row level security;

-- Para uso via backend com SERVICE_ROLE, políticas abaixo são opcionais.
-- Se quiser liberar leitura autenticada no frontend, ajuste as policies conforme sua regra de negócio.
