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

// Update user profile
export async function updateProfile(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update your profile');
  }
  
  try {
    const profileData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      author_bio: formData.get('author_bio') as string,
      twitter_link: formData.get('twitter_link') as string,
      instagram_link: formData.get('instagram_link') as string,
      tiktok_link: formData.get('tiktok_link') as string,
    };
    
    await updateUserProfile(session.user.id, profileData);
    
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
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