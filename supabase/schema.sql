-- TOKEN shared leaderboard schema for Supabase.
-- Run this once in Supabase SQL Editor after creating a project.
-- Only the public anon/publishable key belongs in the static website.
-- No service_role key is needed in the browser.

create table if not exists public.token_players (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 18),
  balance bigint not null default 0 check (balance >= 0),
  all_time_tokens bigint not null default 0 check (all_time_tokens >= 0),
  ads_watched integer not null default 0 check (ads_watched >= 0),
  created_at timestamptz not null default now(),
  last_passive_reward_at timestamptz not null default now(),
  ad_started_at timestamptz,
  ad_cooldown_until timestamptz not null default now()
);

create table if not exists public.token_reward_events (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.token_players(id) on delete cascade,
  amount integer not null check (amount > 0),
  reward_type text not null check (reward_type in ('passive', 'ad')),
  created_at timestamptz not null default now()
);

create index if not exists token_reward_events_created_at_idx
  on public.token_reward_events (created_at desc);
create index if not exists token_reward_events_player_created_idx
  on public.token_reward_events (player_id, created_at desc);

alter table public.token_players enable row level security;
alter table public.token_reward_events enable row level security;
revoke all on public.token_players from anon, authenticated;
revoke all on public.token_reward_events from anon, authenticated;

create or replace function public.token_ensure_player(p_username text)
returns table(username text, balance bigint, all_time_tokens bigint, ads_watched integer, created_at timestamptz, ad_cooldown_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
begin
  if v_uid is null then raise exception 'Sign in as a guest first'; end if;
  v_name := left(regexp_replace(trim(coalesce(p_username, '')), '[[:cntrl:]]', '', 'g'), 18);
  if char_length(v_name) < 2 then
    v_name := 'Guest-' || left(replace(v_uid::text, '-', ''), 6);
  end if;
  insert into public.token_players (id, username, last_passive_reward_at)
  values (v_uid, v_name, now())
  on conflict (id) do nothing;
  return query
    select p.username, p.balance, p.all_time_tokens, p.ads_watched, p.created_at, p.ad_cooldown_until
    from public.token_players p where p.id = v_uid;
end;
$$;

create or replace function public.token_update_username(p_username text)
returns table(username text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
begin
  if v_uid is null then raise exception 'Sign in as a guest first'; end if;
  v_name := left(regexp_replace(trim(coalesce(p_username, '')), '[[:cntrl:]]', '', 'g'), 18);
  if char_length(v_name) < 2 then raise exception 'Username must contain at least 2 characters'; end if;
  update public.token_players p set username = v_name
    where p.id = v_uid;
  if not found then raise exception 'Guest profile not found'; end if;
  return query select p.username from public.token_players p where p.id = v_uid;
end;
$$;

create or replace function public.token_claim_passive()
returns table(granted boolean, balance bigint, all_time_tokens bigint, ads_watched integer, ad_cooldown_until timestamptz, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_player public.token_players%rowtype;
  v_wait integer;
begin
  if v_uid is null then raise exception 'Sign in as a guest first'; end if;
  select p.* into v_player from public.token_players p where p.id = v_uid for update;
  if not found then raise exception 'Guest profile not found'; end if;
  v_wait := greatest(0, ceil(extract(epoch from (v_player.last_passive_reward_at + interval '5 minutes' - now())))::integer);
  if v_wait > 0 then
    return query select false, v_player.balance, v_player.all_time_tokens, v_player.ads_watched, v_player.ad_cooldown_until, v_wait;
    return;
  end if;
  update public.token_players p
    set balance = p.balance + 5,
        all_time_tokens = p.all_time_tokens + 5,
        last_passive_reward_at = now()
    where p.id = v_uid
    returning p.* into v_player;
  insert into public.token_reward_events (player_id, amount, reward_type)
  values (v_uid, 5, 'passive');
  return query select true, v_player.balance, v_player.all_time_tokens, v_player.ads_watched, v_player.ad_cooldown_until, 0;
end;
$$;

create or replace function public.token_start_ad()
returns table(started boolean, retry_after_seconds integer, ad_cooldown_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_player public.token_players%rowtype;
  v_wait integer;
begin
  if v_uid is null then raise exception 'Sign in as a guest first'; end if;
  select p.* into v_player from public.token_players p where p.id = v_uid for update;
  if not found then raise exception 'Guest profile not found'; end if;
  v_wait := greatest(0, ceil(extract(epoch from (v_player.ad_cooldown_until - now())))::integer);
  if v_wait > 0 then
    return query select false, v_wait, v_player.ad_cooldown_until;
    return;
  end if;
  if v_player.ad_started_at is not null and v_player.ad_started_at > now() - interval '2 minutes' then
    return query select false, greatest(1, ceil(extract(epoch from (v_player.ad_started_at + interval '8 seconds' - now())))::integer), v_player.ad_cooldown_until;
    return;
  end if;
  update public.token_players p set ad_started_at = now() where p.id = v_uid returning p.* into v_player;
  return query select true, 0, v_player.ad_cooldown_until;
end;
$$;

create or replace function public.token_cancel_ad()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return false; end if;
  update public.token_players p set ad_started_at = null where p.id = auth.uid();
  return found;
end;
$$;

create or replace function public.token_claim_ad()
returns table(granted boolean, balance bigint, all_time_tokens bigint, ads_watched integer, ad_cooldown_until timestamptz, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_player public.token_players%rowtype;
  v_wait integer;
begin
  if v_uid is null then raise exception 'Sign in as a guest first'; end if;
  select p.* into v_player from public.token_players p where p.id = v_uid for update;
  if not found then raise exception 'Guest profile not found'; end if;
  v_wait := greatest(0, ceil(extract(epoch from (v_player.ad_cooldown_until - now())))::integer);
  if v_wait > 0 then
    return query select false, v_player.balance, v_player.all_time_tokens, v_player.ads_watched, v_player.ad_cooldown_until, v_wait;
    return;
  end if;
  if v_player.ad_started_at is null or now() < v_player.ad_started_at + interval '8 seconds' then
    return query select false, v_player.balance, v_player.all_time_tokens, v_player.ads_watched, v_player.ad_cooldown_until,
      greatest(1, ceil(extract(epoch from (coalesce(v_player.ad_started_at, now()) + interval '8 seconds' - now())))::integer);
    return;
  end if;
  update public.token_players p
    set balance = p.balance + 15,
        all_time_tokens = p.all_time_tokens + 15,
        ads_watched = p.ads_watched + 1,
        ad_started_at = null,
        ad_cooldown_until = now() + interval '30 seconds'
    where p.id = v_uid
    returning p.* into v_player;
  insert into public.token_reward_events (player_id, amount, reward_type)
  values (v_uid, 15, 'ad');
  return query select true, v_player.balance, v_player.all_time_tokens, v_player.ads_watched, v_player.ad_cooldown_until, 0;
end;
$$;

create or replace function public.token_leaderboard(p_period text default 'all', p_limit integer default 50)
returns table(rank_no bigint, username text, tokens bigint, is_you boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(p_period, 'all')) not in ('today', 'week', 'all') then
    raise exception 'Unknown leaderboard period';
  end if;
  return query
  with scores as (
    select p.id, p.username, coalesce(sum(e.amount), 0)::bigint as tokens, p.created_at
    from public.token_players p
    left join public.token_reward_events e on e.player_id = p.id
      and (
        lower(p_period) = 'all'
        or (lower(p_period) = 'today' and e.created_at >= date_trunc('day', now()))
        or (lower(p_period) = 'week' and e.created_at >= date_trunc('week', now()))
      )
    group by p.id, p.username, p.created_at
    having coalesce(sum(e.amount), 0) > 0
  ), ranked as (
    select row_number() over (order by s.tokens desc, s.username asc)::bigint as rank_no,
           s.id, s.username, s.tokens, s.created_at
    from scores s
  )
  select r.rank_no, r.username, r.tokens, (r.id = auth.uid()), r.created_at
  from ranked r
  order by r.rank_no
  limit greatest(1, least(coalesce(p_limit, 50), 100));
end;
$$;

revoke all on function public.token_ensure_player(text) from public;
revoke all on function public.token_update_username(text) from public;
revoke all on function public.token_claim_passive() from public;
revoke all on function public.token_start_ad() from public;
revoke all on function public.token_cancel_ad() from public;
revoke all on function public.token_claim_ad() from public;
revoke all on function public.token_leaderboard(text, integer) from public;

grant execute on function public.token_ensure_player(text) to anon, authenticated;
grant execute on function public.token_update_username(text) to authenticated;
grant execute on function public.token_claim_passive() to authenticated;
grant execute on function public.token_start_ad() to authenticated;
grant execute on function public.token_cancel_ad() to authenticated;
grant execute on function public.token_claim_ad() to authenticated;
grant execute on function public.token_leaderboard(text, integer) to anon, authenticated;
