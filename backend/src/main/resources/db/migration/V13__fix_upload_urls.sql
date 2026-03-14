-- Fix image URLs: /uploads/ -> /api/uploads/
UPDATE products
SET images = REPLACE(images::text, '"/uploads/', '"/api/uploads/')::jsonb
WHERE images::text LIKE '%"/uploads/%';
