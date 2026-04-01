-- === Supabase Stored Procedures for Atomic Stock Management ===
-- Run these in Supabase SQL Editor

-- 1. Count purchases per wallet
CREATE OR REPLACE FUNCTION get_wallet_purchases(
  p_show_id UUID,
  p_wallet TEXT,
  p_tier TEXT DEFAULT 'default'
)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(nb_places), 0)::INTEGER
  FROM ticket_purchases
  WHERE show_id = p_show_id
    AND wallet_address = p_wallet
    AND tier = p_tier
    AND status = 'confirmed';
$$ LANGUAGE sql STABLE;

-- 2. Atomically decrement stock (returns false if not enough)
CREATE OR REPLACE FUNCTION decrement_stock(
  p_show_id UUID,
  p_nb_places INTEGER,
  p_tier TEXT DEFAULT 'default'
)
RETURNS BOOLEAN AS $$
DECLARE
  updated BOOLEAN := FALSE;
BEGIN
  IF p_tier = 'guestlist' THEN
    UPDATE shows
    SET guestlist_remaining = guestlist_remaining - p_nb_places
    WHERE id = p_show_id
      AND guestlist_remaining >= p_nb_places;
  ELSE
    UPDATE shows
    SET remaining_stock = remaining_stock - p_nb_places
    WHERE id = p_show_id
      AND remaining_stock >= p_nb_places;
  END IF;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$ LANGUAGE plpgsql;
