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
  /** "pending" = follow request sent to a private account, not yet accepted. */
  follow_status: "accepted" | "pending" | "none";
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
  is_following_author: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post: string;
  author: UserSummary;
  parent: string | null;
  text: string;
  like_count: number;
  is_liked: boolean;
  replies: Comment[];
  created_at: string;
}

export interface ReelComment {
  id: string;
  reel: string;
  author: UserSummary;
  text: string;
  created_at: string;
}

export interface Notification {
  id: string;
  actor: UserSummary;
  notification_type: "like" | "comment" | "follow" | "follow_request" | "mention" | "tag";
  /** Ids of the post/reel/comment the notification is about, when there is one. */
  post: string | null;
  reel: string | null;
  comment: string | null;
  is_read: boolean;
  created_at: string;
}

export interface BusinessCategory {
  id: number;
  name: string;
  icon: string;
}

export interface BusinessProfile {
  id: string;
  user: UserProfile;
  category: BusinessCategory | null;
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  address: string;
  map_link: string;
  latitude: number | null;
  longitude: number | null;
  opening_hours: Record<string, string>;
}
