'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '@/auth';
import { getUserByEmail, createUser } from '@/app/lib/services/userService';
import { passwordSchema } from '@/app/lib/validation';
import { revalidatePath } from 'next/cache';
import { withAudit } from '@/app/lib/auditMiddleware';
import { logAuditEvent } from '@/app/lib/auditLogger';

// Validation schema for registration
const RegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: passwordSchema,
  terms: z.literal('accepted', {
    invalid_type_error: 'You must accept the terms and conditions'
  })
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  
  try {
    // Log the authentication attempt
    // We use logAuditEvent directly since withAudit expects an operation to return something
    await logAuditEvent(
      'system', // We don't have a user ID yet
      'auth_attempt',
      'user',
      email, // Using email as identifier since we don't have user ID yet
      { email }
    );
    
    await signIn('credentials', {
      email,
      password: formData.get('password'),
      redirect: false,
    });
    
    // Get user ID for successful login audit
    const user = await getUserByEmail(email);
    if (user) {
      await logAuditEvent(
        user.id,
        'auth_success',
        'user',
        user.id,
        { email }
      );
    }
    
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';
    redirect(redirectTo);
  } catch (error) {
    // Log failed authentication
    await logAuditEvent(
      'system',
      'auth_failure',
      'user',
      email,
      { 
        email,
        error: error instanceof AuthError ? error.name : 'unknown'
      }
    );
    
    if (error instanceof AuthError) {
      switch (error.name) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  try {
    // Get current user session before logging out
    const session = await auth();
    const userId = session?.user?.id;
    
    if (userId) {
      // Log the sign out
      await logAuditEvent(
        userId,
        'sign_out',
        'user',
        userId,
        {}
      );
    }
    
    await signOut({ redirectTo: '/' });
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function registerUser(
  prevState: string | undefined,
  formData: FormData,
) {

  if (!formData) {
    return "Form data is missing. Please try again.";
  }


  try {
    // Extract and validate form data
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      terms: formData.get('terms') as string,
    };

    const validatedData = RegistrationSchema.parse(rawData);
    
    // Check if user exists
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      // Log attempted registration with existing email
      await logAuditEvent(
        'system',
        'registration_duplicate',
        'user',
        validatedData.email,
        { email: validatedData.email }
      );
      
      return 'User with this email already exists';
    }
    
    // Create user with audit
    await withAudit(
      'system', // System user since no user is logged in yet
      'user_registration',
      'user',
      validatedData.email, // Use email as ID since user doesn't exist yet
      async () => {
        return await createUser({
          email: validatedData.email,
          password: validatedData.password,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName
        });
      },
      { 
        email: validatedData.email,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName
      }
    );
    
    // revalidatePath('/login');
    // Redirect to login
    //   await signIn('credentials', {
    //   email: validatedData.email,
    //   password: validatedData.password,
    //   redirect: true,
    //   redirectTo: formData.get('redirectTo') as string || '/dashboard'
    // });
    const redirectTo = formData.get('redirectTo') as string || '/';
    redirect(redirectTo);

  } catch (error) {
    // Any withAudit failures are already logged
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    console.error('Registration error:', error);
    return 'Failed to register. Please try again.';
  }
}