create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  dni text unique,
  phone text,
  email text unique,
  created_at timestamp default now()
);

alter table users add column if not exists dni text;
create unique index if not exists users_dni_unique_idx
  on users (dni)
  where dni is not null;

create table if not exists loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  stamps integer default 0,
  total_rewards integer default 0,
  updated_at timestamp default now()
);

create table if not exists loyalty_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  card_id uuid references loyalty_cards(id),
  type text not null check (type in ('stamp_added', 'reward_redeemed')),
  stamps_before integer not null,
  stamps_after integer not null,
  note text,
  created_at timestamp default now()
);

create index if not exists loyalty_events_user_id_created_at_idx
  on loyalty_events (user_id, created_at desc);
