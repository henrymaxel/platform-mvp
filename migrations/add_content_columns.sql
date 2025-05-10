-- migrations/add_content_columns.sql

-- Add word_count column to content_references table
ALTER TABLE content_references 
ADD COLUMN word_count INTEGER DEFAULT 0;

-- Add content column to store the actual text content
ALTER TABLE content_references 
ADD COLUMN content TEXT;

-- Rename word_count in projects to word_count_goal for clarity
ALTER TABLE projects 
RENAME COLUMN word_count TO word_count_goal;

-- Add current_word_count to projects to track total words
ALTER TABLE projects 
ADD COLUMN current_word_count INTEGER DEFAULT 0;

-- Update the sample data to use the new columns
UPDATE content_references 
SET content = content_hash,
    word_count = CASE 
      WHEN content_hash IS NOT NULL AND length(content_hash) > 0 THEN 
        (char_length(content_hash) - char_length(replace(content_hash, ' ', '')) + 1)
      ELSE 0
    END
WHERE content_hash IS NOT NULL;

-- Create a function to update project word count
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
$$ LANGUAGE plpgsql;

-- Create trigger to update project word count when chapter word count changes
CREATE TRIGGER update_project_word_count_trigger
AFTER INSERT OR UPDATE ON content_references
FOR EACH ROW
EXECUTE FUNCTION update_project_word_count();