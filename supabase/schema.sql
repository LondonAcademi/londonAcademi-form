-- 1. CAMPUSES
create table campuses (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  ville text not null
);

insert into campuses (nom, ville) values
  ('Bouskoura', 'Casablanca'),
  ('Dar Bouazza', 'Casablanca'),
  ('Souissi', 'Rabat');

-- 2. NIVEAUX
create table niveaux (
  id uuid default gen_random_uuid() primary key,
  nom text not null,  -- Préscolaire, Primaire, Collège, Lycée
  ordre integer not null
);

insert into niveaux (nom, ordre) values
  ('Préscolaire', 1),
  ('Primaire', 2),
  ('Collège', 3),
  ('Lycée', 4);

-- 3. CLASSES
create table classes (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  niveau_id uuid references niveaux(id),
  campus_id uuid references campuses(id),
  places_total integer not null default 20,
  places_reservees integer not null default 0,
  prix_reservation decimal(10,2) not null default 500.00
);

insert into classes (nom, niveau_id, campus_id, places_total, places_reservees, prix_reservation)
select
  c.nom,
  n.id as niveau_id,
  camp.id as campus_id,
  c.places_total,
  c.places_reservees,
  c.prix
from (values
  ('Petite Section',    'Préscolaire', 'Bouskoura', 20, 14, 400.00),
  ('Moyenne Section',   'Préscolaire', 'Bouskoura', 20, 17, 400.00),
  ('Grande Section',    'Préscolaire', 'Bouskoura', 20, 11, 400.00),
  ('CP',                'Primaire',    'Bouskoura', 25, 19, 500.00),
  ('CE1',               'Primaire',    'Bouskoura', 25, 16, 500.00),
  ('CE2',               'Primaire',    'Bouskoura', 25, 13, 500.00),
  ('CM1',               'Primaire',    'Bouskoura', 25, 20, 500.00),
  ('CM2',               'Primaire',    'Bouskoura', 25, 18, 500.00),
  ('1ère Année',        'Collège',     'Bouskoura', 30, 24, 600.00),
  ('2ème Année',        'Collège',     'Bouskoura', 30, 21, 600.00),
  ('3ème Année',        'Collège',     'Bouskoura', 30, 27, 600.00),
  ('Tronc Commun',      'Lycée',       'Bouskoura', 30, 25, 700.00),
  ('1ère Bac',          'Lycée',       'Bouskoura', 30, 22, 700.00),
  ('2ème Bac',          'Lycée',       'Bouskoura', 30, 28, 700.00)
) as c(nom, niveau, campus, places_total, places_reservees, prix)
join niveaux n on n.nom = c.niveau
join campuses camp on camp.nom = c.campus;

-- 4. REGISTRATIONS
create table registrations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),

  -- Step 1
  campus_id uuid references campuses(id),
  nom text not null,
  prenom text not null,
  telephone text not null,
  email text not null,
  ville text,
  child_age integer,
  current_school text,
  additional_info text,

  -- Step 2
  niveau_id uuid references niveaux(id),
  classe_id uuid references classes(id),

  -- Step 3
  seat_number integer,  -- null = pas de siège choisi

  -- Step 4 & 5
  prix_total decimal(10,2),
  payment_status text default 'pending', -- pending | paid | failed
  payment_id text,

  -- Status
  status text default 'incomplete' -- incomplete | complete
);

-- 5. RLS (Row Level Security)
alter table registrations enable row level security;
alter table campuses enable row level security;
alter table niveaux enable row level security;
alter table classes enable row level security;

create policy "Public read campuses" on campuses for select using (true);
create policy "Public read niveaux" on niveaux for select using (true);
create policy "Public read classes" on classes for select using (true);
create policy "Public insert registrations" on registrations for insert with check (true);
create policy "Public read own registration" on registrations for select using (true);

-- 6. FUNCTION — increment places_reservees after registration
create or replace function increment_places_reservees(classe_uuid uuid)
returns void as $$
begin
  update classes
  set places_reservees = places_reservees + 1
  where id = classe_uuid;
end;
$$ language plpgsql security definer;
