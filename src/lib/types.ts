export interface UserSummary {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  is_business: boolean;
}

export interface Highlight {
  id: string;
  title: string;
  cover_url: string;
}

export interface UserProfile extends UserSummary {
  bio: string;
  website: string;
  phone_number: string;
  is_private: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  highlights: Highlight[];
  is_following: boolean;
}

export interface PostMedia {
  id: string;
  media_type: "image" | "video";
  file_url: string;
  order: number;
}

export interface Post {
  id: string;
  author: UserSummary;
  caption: string;
  location_name: string;
  hashtags: { id: number; name: string }[];
  tagged_users: UserSummary[];
  media: PostMedia[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_saved: boolean;
  comments_disabled: boolean;
  like_count_hidden: boolean;
  created_at: string;
}

export interface StorySticker {
  id: string;
  sticker_type: "poll" | "question" | "countdown" | "link";
  data: Record<string, unknown>;
  pos_x: number;
  pos_y: number;
}

export interface Story {
  id: string;
  author: UserSummary;
  media_type: "image" | "video";
  file_url: string;
  caption: string;
  stickers: StorySticker[];
  viewer_count: number;
  is_viewed: boolean;
  created_at: string;
  expires_at: string;
}

export interface StoryGroup {
  author: UserSummary;
  stories: Story[];
  allViewed: boolean;
}

export interface Reel {
  id: string;
  author: UserSummary;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  audio_title: string;
  view_count: number;
  share_count: number;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post: string;
  author: UserSummary;
  parent: string | null;
  text: string;
  like_count: number;
  replies: Comment[];
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  user: UserProfile;
  category: { id: number; name: string; icon: string } | null;
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  address: string;
  map_link: string;
}
