// app/lib/services/userService.ts
import { sql } from '@/app/lib/database';
import { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user || null;
  } catch (error) {
    console.error('Failed to fetch user by email:', error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE id = ${id}
    `;
    return user || null;
  } catch (error) {
    console.error('Failed to fetch user by ID:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<User> {
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  try {
    const result = await sql`
      INSERT INTO users (
        email, 
        password, 
        first_name, 
        last_name,
        role,
        email_verified,
        terms_accepted,
        created_at,
        updated_at,
        subscription_tier_id
      ) VALUES (
        ${userData.email},
        ${hashedPassword},
        ${userData.first_name},
        ${userData.last_name},
        'user',
        false,
        true,
        NOW(),
        NOW(),
        (SELECT id FROM subscription_tiers WHERE name = 'Free' LIMIT 1)
      )
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

/**
 * Update user details
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<{
    first_name: string;
    last_name: string;
    profile_picture_url: string;
    author_bio: string;
    twitter_link: string;
    instagram_link: string;
    tiktok_link: string;
  }>
): Promise<User> {
  try {
    // Build dynamic query parts
    const updateFields = [];
    const updateValues = [];
    
    if (profileData.first_name !== undefined) {
      updateFields.push('first_name = $1');
      updateValues.push(profileData.first_name);
    }
    
    if (profileData.last_name !== undefined) {
      updateFields.push('last_name = $2');
      updateValues.push(profileData.last_name);
    }
    
    if (profileData.profile_picture_url !== undefined) {
      updateFields.push('profile_picture_url = $3');
      updateValues.push(profileData.profile_picture_url);
    }
    
    if (profileData.author_bio !== undefined) {
      updateFields.push('author_bio = $4');
      updateValues.push(profileData.author_bio);
    }
    
    if (profileData.twitter_link !== undefined) {
      updateFields.push('twitter_link = $5');
      updateValues.push(profileData.twitter_link);
    }
    
    if (profileData.instagram_link !== undefined) {
      updateFields.push('instagram_link = $6');
      updateValues.push(profileData.instagram_link);
    }
    
    if (profileData.tiktok_link !== undefined) {
      updateFields.push('tiktok_link = $7');
      updateValues.push(profileData.tiktok_link);
    }
    
    // Add updated_at field
    updateFields.push('updated_at = NOW()');
    
    // Execute query with the service's query helper
    const result = await sql`
      UPDATE users 
      SET ${sql.unsafe(updateFields.join(', '))}
      WHERE id = ${userId}
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    // Get user with current password
    const [user] = await sql<User[]>`
      SELECT password FROM users WHERE id = ${userId}
    `;
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
}