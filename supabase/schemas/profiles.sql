-- Creates the profiles table: one row per authenticated user (the guide), holding their name, optional business details, and their own banking details, which are reused across all tours.
CREATE TABLE profiles (
id uuid PRIMARY KEY,
full_name text,
business_name text,
phone text,
banking_details text,
created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensures every profile belongs to a real Supabase user, and that deleting a user deletes their profile.
ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;