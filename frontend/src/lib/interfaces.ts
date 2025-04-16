export interface ProfileData {
  id: number;
  username: string;
  role: string;
  profile_picture_url: string | null;
  reputation: number;
  number_of_posts: number;
  number_of_solutions: number;
}

export interface CommentData {
  id: number;
  content: string;
  pictures?: string[];
  post_id: number;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  dislike_count: number;
  is_liked: boolean;
  is_disliked: boolean;
  user: {
    id: number;
    username: string;
    profile_picture_url: string | null;
  };
}

export interface PostData {
  id: number;
  title: string;
  content: string;
  comments?: CommentData[];
  pictures?: string[];
  tags?: string[];
  comment_count: number;
  created_at: string;
  is_metoo: boolean;
  metoo_count: number;
  is_watchlisted: boolean;
  solution: {
    id: number;
    pictures?: string[];
    content: string;
    user: {
      id: number;
      username: string;
      profile_picture_url: string | null;
    };
    created_at: string;
  } | null;
  user: {
    id: number;
    username: string;
    profile_picture_url: string | null;
  };
}
