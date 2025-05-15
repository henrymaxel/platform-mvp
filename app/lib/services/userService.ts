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
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<User> {
  try {
    // Ensure userId exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Update all fields in a single query
    const result = await sql<User[]>`
      UPDATE users 
      SET 
        first_name = ${data.first_name ?? existingUser.first_name},
        last_name = ${data.last_name ?? existingUser.last_name},
        author_bio = ${data.author_bio ?? existingUser.author_bio},
        twitter_link = ${data.twitter_link ?? existingUser.twitter_link},
        instagram_link = ${data.instagram_link ?? existingUser.instagram_link},
        tiktok_link = ${data.tiktok_link ?? existingUser.tiktok_link},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to update user');
    }
    
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