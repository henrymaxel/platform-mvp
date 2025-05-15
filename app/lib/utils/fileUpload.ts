import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure this directory exists in your project
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'profiles');

mkdir(UPLOADS_DIR, { recursive: true }).catch(error => {
  console.error('Failed to create uploads directory:', error);
});

/**
 * Upload a profile picture
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  try {
    // Create a unique filename
    const filename = `${userId}-${uuidv4()}${path.extname(file.name)}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write file to disk
    await writeFile(filepath, buffer);
    
    // Return the URL (relative to public directory)
    return `/uploads/profiles/${filename}`;
  } catch (error) {
    console.error('Failed to upload profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
}