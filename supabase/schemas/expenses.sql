-- Creates the expenses table: one row per expense on a tour, holding the vendor, category, amount, date, and the location of the stored receipt image.
CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    description text NOT NULL,                       -- vendor / shop name
    category text NOT NULL DEFAULT 'other',          -- saved as 'other:<label>' when the guide types a custom category
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    expense_date date NOT NULL DEFAULT current_date,
    receipt_path text,                               -- where the receipt image sits in Storage; empty until one is attached
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensures every expense belongs to a real tour, and that deleting a tour deletes its expenses.
ALTER TABLE expenses
    ADD CONSTRAINT expenses_tour_id_fkey
    FOREIGN KEY (tour_id) REFERENCES tours (id) ON DELETE CASCADE;

-- Ensures every expense belongs to a real Supabase user, and that deleting a user deletes their expenses.
ALTER TABLE expenses
    ADD CONSTRAINT expenses_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES auth.users (id) ON DELETE CASCADE;