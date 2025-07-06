export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  stars: number;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  coverImageUrl: string;
  description: string;
  members: number;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  stars: number;
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  community: Community;
  createdAt: string;
  votes: number;
  comments: Comment[];
  pollOptions?: PollOption[];
}
