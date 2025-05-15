export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  email_verified: boolean;
  email_verified_at: Date | null;
  image: string | null;
  phone_number: string | null;
  profile_picture_url: string | null;
  author_bio: string | null;
  twitter_link: string | null;
  instagram_link: string | null;
  tiktok_link: string | null;
  role: string;
  subscription_tier_id: number | null;
  terms_accepted: boolean;
  terms_accepted_at: Date | null;
  public_profile: boolean;
  show_email: boolean;
  show_social: boolean;
  username: string | null;
  created_at: Date;
  updated_at: Date;
}

export type UserProfile = {
  first_name?: string;
  last_name?: string;
  author_bio?: string | null;
  profile_picture_url?: string | null;
  twitter_link?: string | null;
  instagram_link?: string | null;
  tiktok_link?: string | null;
  public_profile?: boolean;
  show_email?: boolean;
  show_social?: boolean;
}

export type AuthUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  profile_picture_url: string | null;
};

export type Chapter = {
  id: string;
  title: string;
  chapter_number: number;
  storage_path: number;
  content: string;
  word_count: number;
  status: 'completed' | 'in-progress' | 'outline';
  created_at: Date;
  updated_at: Date;
  project_id: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  word_count_goal: number;
  current_word_count: number;
  status: 'active' | 'archived' | 'completed';
  visibility: 'private' | 'public'
  user_id: string;
  created_at: Date;
  updated_at: Date;
  chapters?: Chapter[];
};

export type SubscriptionTier = {
  id: number;
  name: string;
  price: number;
  max_project_count: number;
  monthly_ai_token_limit: number;
  max_asset_per_project: number;
  created_at: Date;
  updated_at: Date;
}

export type ProjectsWithSubscription = {
  projects: Project[];
  subscription: {
    tier_name: string;
    max_project_count: number;
    current_project_count: number;
  };
};