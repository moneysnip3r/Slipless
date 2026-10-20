-- Turns on Row Level Security for every table, so nobody can read or change a row unless a policy below allows it.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- A signed-in guide can read and change only their own profile (the profile id is the user's id).
CREATE POLICY profiles_own_row ON profiles
    FOR ALL TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- A signed-in guide can read and change only their own tours.
CREATE POLICY tours_own_rows ON tours
    FOR ALL TO authenticated
    USING (owner_id = (SELECT auth.uid()))
    WITH CHECK (owner_id = (SELECT auth.uid()));

-- A signed-in guide can read and change only their own expenses, and can only put an expense on a tour they own.
CREATE POLICY expenses_own_rows ON expenses
    FOR ALL TO authenticated
    USING (owner_id = (SELECT auth.uid()))
    WITH CHECK (
        owner_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM tours
            WHERE tours.id = expenses.tour_id
            AND tours.owner_id = (SELECT auth.uid())
        )
    );

-- A signed-in guide can read, upload, replace and delete only the files inside their own folder of the private "receipts" bucket.
-- Files are stored as <user id>/<tour id>/<expense id>.jpg, so the first folder in the path is the user's id.
CREATE POLICY receipts_own_folder ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    )
    WITH CHECK (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    );