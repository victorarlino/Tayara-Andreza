-- Execute no SQL Editor do Supabase para liberar cadastro de fã-clube
-- quando o backend usar chave anon (sem SERVICE_ROLE).

alter table if exists public.fan_clubes enable row level security;

drop policy if exists fan_clubes_insert on public.fan_clubes;
drop policy if exists fan_clubes_select on public.fan_clubes;
drop policy if exists fan_clubes_delete on public.fan_clubes;

create policy fan_clubes_insert
on public.fan_clubes
for insert
to anon, authenticated
with check (true);

create policy fan_clubes_select
on public.fan_clubes
for select
to anon, authenticated
using (true);

create policy fan_clubes_delete
on public.fan_clubes
for delete
to authenticated
using (true);
