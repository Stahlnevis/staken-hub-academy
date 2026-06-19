
CREATE POLICY "Admins manage poster uploads insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage poster uploads update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage poster uploads delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read poster uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));
