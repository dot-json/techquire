export interface ProfileData {
  id: number;
  username: string;
  profile_picture_url: string | null;
  reputation: number;
  number_of_posts: number;
  number_of_solutions: number;
}

export interface PostData {
  id: number;
  title: string;
  content: string;
  solution: {
    id: number;
    content: string;
    user: {
      id: number;
      username: string;
    };
    created_at: string;
  };
  user: {
    id: number;
    username: string;
  };
  comment_count: number;
  created_at: string;
  metoo?: boolean;
  watched?: boolean;
}
