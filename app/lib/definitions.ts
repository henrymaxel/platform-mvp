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

export type Publication = {
  id: string;
  project_id: string;
  title: string;
  publisher?: string;
  status: string; // 'pending', 'published', 'rejected'
  isbn?: string;
  metadata_cid?: string;
  cover_cid?: string; 
  first_edition_timestamp?: string;
  version?: string;
  rejection_reason?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  views_count?: number;
  unique_readers_count?: number;
  completion_rate?: number;
};

export type LibraryMetadata = {
  id: string;
  publication_id: string;
  genre: string;
  tags: string[]; // Stored as JSON in DB
  keywords: string;
  language: string;
  reading_time_estimate: number;
  created_at: string;
  updated_at: string;
};

export type NFTCharacterProfile = {
  id: string;
  asset_id: string;
  user_id: string;
  character_name: string;
  character_description: string;
  personality_traits: Record<string, any>;
  backstory: string;
  role_in_story: string;
  visual_appearance: string;
  is_protagonist: boolean;
  is_antagonist: boolean;
  is_supporting: boolean;
  is_complete: boolean; // New field
  created_at: string;
  updated_at: string;
};

export type NFTWithProfile = {
  id: string;
  collection_name: string;
  token_id: string;
  image_url: string;
  wallet_address: string;
  character_name: string;
  character_bio: string;
  profile?: NFTCharacterProfile;
  is_profile_complete: boolean;
  token_metadata: any;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};