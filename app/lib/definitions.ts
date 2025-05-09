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
  created_at: Date;
  updated_at: Date;
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
