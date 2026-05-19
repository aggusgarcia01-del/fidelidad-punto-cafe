# PuntoCafe Rewards

PWA mobile-first de fidelizacion para una cafeteria specialty coffee.

## Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- Supabase Auth Magic Links
- Supabase PostgreSQL
- Route Handlers
- QR para cliente/admin
- Base para Apple Wallet y Google Wallet

## Variables

Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PIN=
CUSTOMER_SESSION_SECRET=
```

`CUSTOMER_SESSION_SECRET` firma la cookie del acceso rapido por telefono. En
produccion debe ser un valor largo y aleatorio.

## SQL inicial

Tambien esta en `supabase/schema.sql`.

```sql
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
```

## Desarrollo

```bash
npm install
npm run dev
```

## Checklist produccion

- Rotar `SUPABASE_SERVICE_ROLE_KEY` antes de publicar.
- Cambiar `ADMIN_PIN`.
- Cambiar `CUSTOMER_SESSION_SECRET`.
- Para maxima seguridad, migrar acceso por telefono a SMS OTP antes de escalar.
- En Supabase Auth, configurar `Site URL` con el dominio final.
- Agregar `https://tu-dominio/auth/callback` en Redirect URLs.
- En Vercel, copiar todas las variables de `.env.local`.
- Probar registro, suma de sello, canje y PWA instalada desde un celular real.
