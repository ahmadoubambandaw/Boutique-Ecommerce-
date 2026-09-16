-- Add a "Pointure" (shoe size) option to every chaussures/bottes product.
-- Sizes 39–46 cover the standard EU safety-footwear range. Each variant
-- inherits its product's current price, compare-at price and availability,
-- so draft products (price 0, unavailable) stay hidden until priced, while
-- already-live products immediately get a size picker on the storefront.
--
-- Idempotent: re-running replaces options/variants with the same values.
UPDATE products
SET
  options = '[{"name":"Pointure","values":["39","40","41","42","43","44","45","46"]}]'::jsonb,
  variants = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', products.id || '-' || size,
        'title', size,
        'price', products.price,
        'compareAtPrice', products.compare_at_price,
        'options', jsonb_build_object('Pointure', size),
        'available', products.available
      )
    )
    FROM unnest(ARRAY['39','40','41','42','43','44','45','46']) AS size
  )
WHERE title ILIKE '%chaussure%'
   OR title ILIKE '%botte%'
   OR handle ILIKE '%chaussure%'
   OR handle ILIKE '%botte%';
