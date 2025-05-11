-- migrations/add_default_subscription_tiers.sql

-- Insert default subscription tiers if they don't exist
INSERT INTO subscription_tiers (
  name,
  price,
  max_project_count,
  monthly_ai_token_limit,
  max_assets_per_project,
  created_at,
  updated_at
) VALUES 
  (
    'Free',
    0,
    3, -- Free tier allows 3 projects
    50000,
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Pro',
    19.99,
    10, -- Pro tier allows 10 projects
    500000,
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (name) DO NOTHING;

-- Update users without a subscription tier to use the Free tier
UPDATE users
SET subscription_tier_id = (
  SELECT id FROM subscription_tiers WHERE name = 'Free' LIMIT 1
)
WHERE subscription_tier_id IS NULL;