-- Clean up price fields in programmes and bootcamps tables
-- Strips commas, spaces, "KSH", "KES" etc. and stores as plain number string

UPDATE programmes
SET price = REGEXP_REPLACE(price, '[^0-9.]', '', 'g')
WHERE price ~ '[^0-9.]';

UPDATE bootcamps
SET price = REGEXP_REPLACE(price, '[^0-9.]', '', 'g')
WHERE price ~ '[^0-9.]';
