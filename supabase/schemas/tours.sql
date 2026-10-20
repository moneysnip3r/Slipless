-- Creates the tours table: one row per tour, holding the client, dates, guide fee per day, advance paid, and notes. Each tour belongs to one guide (owner_id).
CREATE TABLE tours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL,
    title text NOT NULL,
    client_name text NOT NULL,
    status text NOT NULL DEFAULT 'in_progress',  -- the full list of status values is still to be decided
    start_date date NOT NULL,
    end_date date,                               -- optional
    guide_fee_per_day numeric(12,2) NOT NULL DEFAULT 0,
    advance_amount numeric(12,2) NOT NULL DEFAULT 0,
    notes text,                                  -- optional
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensures every tour belongs to a real Supabase user, and that deleting a user deletes their tours.
ALTER TABLE tours
    ADD CONSTRAINT tours_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES auth.users (id) ON DELETE CASCADE;