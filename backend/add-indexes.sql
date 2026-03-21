-- Add indexes to optimize sorting and avoid "Out of sort memory" errors
CREATE INDEX IF NOT EXISTS idx_created_at ON cars(created_at);
CREATE INDEX IF NOT EXISTS idx_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_mileage ON cars(mileage);
CREATE INDEX IF NOT EXISTS idx_views_count ON cars(views_count);

-- Show all indexes
SHOW INDEX FROM cars;
