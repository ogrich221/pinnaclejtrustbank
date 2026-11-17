CREATE POLICY "Customers can read their own application"
ON public.account_applications FOR SELECT TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));