-- Tabulka klientek
create table if not exists klientky (
  id uuid default gen_random_uuid() primary key,
  jmeno text not null,
  telefon text default '',
  poznamka text,
  created_at timestamp with time zone default now()
);

-- Tabulka rezervaci
create table if not exists rezervace (
  id uuid default gen_random_uuid() primary key,
  klientka_id uuid references klientky(id) on delete cascade,
  datum text not null,
  cas_od text not null,
  delka_minut integer not null default 60,
  sluzba text not null,
  cena integer,
  zaplaceno boolean default false,
  stav text default 'ceka',
  foto_vlasu text,
  foto_receptu text,
  created_at timestamp with time zone default now()
);

-- Tabulka poptavek
create table if not exists poptavky (
  id uuid default gen_random_uuid() primary key,
  jmeno text not null,
  telefon text default '',
  sluzba text not null,
  poznamka text,
  foto_vlasu text,
  foto_inspirace text,
  datum text not null,
  stav text default 'nova',
  created_at timestamp with time zone default now()
);

-- Povoleni cteni/zapisu pro vsechny (pro zjednoduseni - bez autentizace)
alter table klientky enable row level security;
alter table rezervace enable row level security;
alter table poptavky enable row level security;

create policy "Povol vse klientky" on klientky for all using (true) with check (true);
create policy "Povol vse rezervace" on rezervace for all using (true) with check (true);
create policy "Povol vse poptavky" on poptavky for all using (true) with check (true);
