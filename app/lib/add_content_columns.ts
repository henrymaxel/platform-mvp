//app/lib/add_content_columns.ts
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });

async function addContentColumns() {
  try {
    console.log('Starting migration: Adding content columns...');

    // Add word_count column to content_references table
    await sql`
      ALTER TABLE content_references 
      ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0
    `;
    console.log('Added word_count column to content_references');

    // Add content column to store the actual text content
    await sql`
      ALTER TABLE content_references 
      ADD COLUMN IF NOT EXISTS content TEXT
    `;
    console.log('Added content column to content_references');

    // Check if word_count_goal column exists before renaming
    const wordCountGoalExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name = 'word_count_goal'
    `;

    if (wordCountGoalExists.length === 0) {
      // Rename word_count in projects to word_count_goal for clarity
      await sql`
        ALTER TABLE projects 
        RENAME COLUMN word_count TO word_count_goal
      `;
      console.log('Renamed word_count to word_count_goal in projects');
    } else {
      console.log('word_count_goal column already exists');
    }

    // Add current_word_count to projects to track total words
    await sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS current_word_count INTEGER DEFAULT 0
    `;
    console.log('Added current_word_count column to projects');

    // Update the sample data to use the new columns
    await sql`
      UPDATE content_references 
      SET content = content_hash,
          word_count = CASE 
            WHEN content_hash IS NOT NULL AND length(content_hash) > 0 THEN 
              (char_length(content_hash) - char_length(replace(content_hash, ' ', '')) + 1)
            ELSE 0
          END
      WHERE content_hash IS NOT NULL
    `;
    console.log('Updated existing data to use new columns');

    // Create a function to update project word count
    await sql`
      CREATE OR REPLACE FUNCTION update_project_word_count()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE projects
          SET current_word_count = (
              SELECT COALESCE(SUM(word_count), 0)
              FROM content_references
              WHERE project_id = NEW.project_id
          )
          WHERE id = NEW.project_id;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('Created update_project_word_count function');

    // Create trigger to update project word count when chapter word count changes
    await sql`
      DROP TRIGGER IF EXISTS update_project_word_count_trigger ON content_references
    `;
    
    await sql`
      CREATE TRIGGER update_project_word_count_trigger
      AFTER INSERT OR UPDATE ON content_references
      FOR EACH ROW
      EXECUTE FUNCTION update_project_word_count()
    `;
    console.log('Created update_project_word_count_trigger');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addContentColumns();