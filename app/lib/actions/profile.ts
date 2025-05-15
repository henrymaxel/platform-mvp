// app/lib/actions/profile.ts
'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { getUserById, updateUserProfile, changePassword } from '@/app/lib/services/userService';
import { UnauthorizedError, BadRequestError } from '@/app/lib/errors';
import { passwordSchema } from '@/app/lib/validation';
import { z } from 'zod';

// Get user profile
export async function getUserProfile() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view your profile');
  }
  
  try {
    const user = await getUserById(session.user.id);
    return {
      id: user?.id,
      email: user?.email,
      first_name: user?.first_name,
      last_name: user?.last_name,
      profile_picture_url: user?.profile_picture_url,
      author_bio: user?.author_bio,
      twitter_link: user?.twitter_link,
      instagram_link: user?.instagram_link,
      tiktok_link: user?.tiktok_link,
    };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

// Profile update validation schema
const ProfileUpdateSchema = z.object({
  first_name: z.string().trim().optional(),
  last_name: z.string().trim().optional(),
  author_bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  twitter_username: z.string().regex(/^[A-Za-z0-9_]{1,15}$/, 'Please enter a valid X username').optional().or(z.literal('')),
  instagram_username: z.string().regex(/^[A-Za-z0-9_.]{1,30}$/, 'Please enter a valid Instagram username').optional().or(z.literal('')),
  tiktok_username: z.string().regex(/^[A-Za-z0-9_.]{1,24}$/, 'Please enter a valid TikTok username').optional().or(z.literal(''))
});

// Update user profile
export async function updateProfile(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update your profile');
  }
  
  try {
    // Extract form data
    const profileData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      author_bio: formData.get('author_bio') as string,
      twitter_link: formData.get('twitter_link') as string,
      instagram_link: formData.get('instagram_link') as string,
      tiktok_link: formData.get('tiktok_link') as string,
    };
    
    const profilePicture = formData.get('profile_picture') as File | null;

    // Validate the data
    const validatedData = ProfileUpdateSchema.parse(profileData);

    let profilePictureUrl: string | undefined;

    if (profilePicture && profilePicture.size > 0) {
      profilePictureUrl = await uploadProfilePicture(session.user.id, profilePicture);
    }
    
    // Build full social links from usernames
    let updatedData: any = { ...validatedData };
    
    if (validatedData.twitter_username) {
      updatedData.twitter_link = `https://x.com/${validatedData.twitter_username}`;
    }
    
    if (validatedData.instagram_username) {
      updatedData.instagram_link = `https://instagram.com/${validatedData.instagram_username}`;
    }
    
    if (validatedData.tiktok_username) {
      updatedData.tiktok_link = `https://tiktok.com/@${validatedData.tiktok_username}`;
    }
    
    // Add profile picture URL if we have one
    if (profilePictureUrl) {
      updatedData.profile_picture_url = profilePictureUrl;
    }
    
    // Remove the username fields before updating
    delete updatedData.twitter_username;
    delete updatedData.instagram_username;
    delete updatedData.tiktok_username;
    
    // Update the profile
    await updateUserProfile(session.user.id, updatedData);
    
    // Revalidate cached paths
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/settings/profile');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    throw error;
  }
}

// Password update validation schema
const PasswordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Update password
export async function updatePassword(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to change your password');
  }
  
  try {
    // Extract and validate password data
    const passwordData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string
    };
    
    const validatedData = PasswordUpdateSchema.parse(passwordData);
    
    // Call service to change password
    await changePassword(
      session.user.id,
      validatedData.currentPassword,
      validatedData.newPassword
    );
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    throw error;
  }
}