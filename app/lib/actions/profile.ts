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
  twitter_link: z.string().optional().or(z.literal('')),
  instagram_link: z.string().optional().or(z.literal('')),
  tiktok_link: z.string().optional().or(z.literal('')),
  public_profile: z.boolean().optional(),
  show_email: z.boolean().optional(),
  show_social: z.boolean().optional()
});

// Update user profile
export async function updateProfile(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update your profile');
  }
  
  try {
    console.log('Processing profile update for user:', session.user.id);

    // Extract form data
    const profileData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      author_bio: formData.get('author_bio') as string,
      twitter_link: formData.get('twitter_link') as string,
      instagram_link: formData.get('instagram_link') as string,
      tiktok_link: formData.get('tiktok_link') as string,
      public_profile: formData.get('public_profile') === 'on' || formData.get('public_profile') === 'true',
      show_email: formData.get('show_email') === 'on' || formData.get('show_email') === 'true',
      show_social: formData.get('show_social') === 'on' || formData.get('show_social') === 'true'
    };

    console.log('Extracted profile data: ', profileData);
    
    const profilePicture = formData.get('profile_picture') as File | null;
    console.log('Profile picture received:', profilePicture ? `File: ${profilePicture.name}` : 'None');

    // Validate the data
    try {
      const validatedData = ProfileUpdateSchema.parse(profileData);
      console.log('Data validation successful:', validatedData);

      let profilePictureUrl: string | undefined;

      // Use validated data directly
      let updatedData = { ...validatedData };

      if (profilePictureUrl) {
        updatedData.profile_picture_url = profilePictureUrl;
      }
      
      // Update the profile
      await updateUserProfile(session.user.id, updatedData);
    
      // Revalidate cached paths
      revalidatePath('/dashboard/profile');
      revalidatePath('/dashboard/settings/profile');
      revalidatePath('/dashboard');
    
      return { success: true };

    } catch (error) {
      console.error('Data validation failed: ', error);
      throw error;
    }
    

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