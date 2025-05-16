//app/lib/actions/dashboard.ts
'use server';

import { auth } from '@/auth';
import { getUserStats, getUserActivities } from '@/app/lib/services/dashboardService';
import { UnauthorizedError } from '@/app/lib/errors';
import { getUserById } from '../services/userService';

/**
 * Get dashboard data for the current user
 */
export async function getDashboardData(limit: number = 5) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view dashboard data');
  }
  
  try {
    const userId = session.user.id;
    
    // Get stats and activities in parallel
    const [stats, activities] = await Promise.all([
      getUserStats(userId),
      getUserActivities(userId, limit)
    ]);
    
    return {
      stats,
      activities
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const user = await getUserById(session.user.id);
    return user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
}