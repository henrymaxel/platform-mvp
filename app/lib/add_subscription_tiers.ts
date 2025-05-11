// app/lib/add_subscription_tiers.ts
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });

async function addSubscriptionTiers() {
  try {
    console.log('Adding subscription tiers...');

    // Add default subscription tiers
    await sql`
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
          3,
          50000,
          10,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        (
          'Pro',
          19.99,
          10,
          500000,
          50,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      ON CONFLICT (name) DO UPDATE SET
        max_project_count = EXCLUDED.max_project_count,
        monthly_ai_token_limit = EXCLUDED.monthly_ai_token_limit,
        max_assets_per_project = EXCLUDED.max_assets_per_project,
        updated_at = CURRENT_TIMESTAMP
    `;
    console.log('✓ Default subscription tiers added/updated');

    // Update users without a subscription tier
    await sql`
      UPDATE users
      SET subscription_tier_id = (
        SELECT id FROM subscription_tiers WHERE name = 'Free' LIMIT 1
      )
      WHERE subscription_tier_id IS NULL
    `;
    console.log('✓ Users updated with default Free tier');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addSubscriptionTiers();