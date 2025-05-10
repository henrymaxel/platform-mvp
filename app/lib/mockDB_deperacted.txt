import { User } from './definitions';
import bcrypt from 'bcryptjs';

let users: User[] = [];

// Initialize with a test user
async function initMockDb() {
    if (users.length === 0) {
        // Create a test user with a properly hashed password
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        users.push({
            id: '123e4567-e89b-12d3-a456-426614174000',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            password: hashedPassword,
            email_verified: true,
            email_verified_at: null,
            image: null,
            phone_number: null,
            profile_picture_url: null,
            author_bio: 'I am a test user for development.',
            twitter_link: null,
            instagram_link: null,
            tiktok_link: null,
            role: 'admin',
            subscription_tier_id: null,
            terms_accepted: true,
            terms_accepted_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        });
        
        console.log('Mock database initialized with test user');
    }
}

// Initialize the mock DB
initMockDb();

// Mock DB functions that mimic real DB operations
export async function findUserByEmail(email: string): Promise<User | undefined> {
    return users.find(user => user.email === email);
}

export async function createUser(userData: Partial<User>): Promise<User> {
    const newUser: User = {
        id: `user-${users.length + 1}`,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        password: userData.password || '',
        email_verified: userData.email_verified || false,
        email_verified_at: userData.email_verified_at || null,
        image: userData.image || null,
        phone_number: userData.phone_number || null,
        profile_picture_url: userData.profile_picture_url || null,
        author_bio: userData.author_bio || null,
        twitter_link: userData.twitter_link || null,
        instagram_link: userData.instagram_link || null,
        tiktok_link: userData.tiktok_link || null,
        role: userData.role || 'user',
        subscription_tier_id: userData.subscription_tier_id || null,
        terms_accepted: userData.terms_accepted || false,
        terms_accepted_at: userData.terms_accepted_at || null,
        created_at: new Date(),
        updated_at: new Date()
    };
    
    users.push(newUser);
    return newUser;
}
