
export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  stars?: number;
  role?: 'admin' | 'user';
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
  votes: number;
  replies?: Comment[];
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Post {
  id:string;
  title: string;
  content: string;
  author: User;
  community: Community;
  createdAt: string;
  votes: number;
  comments: Comment[];
  pollOptions?: PollOption[];
  status?: 'published' | 'draft';
}

export interface Notification {
    id:string;
    text: string;
    createdAt: string;
    read: boolean;
    href: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
    id: string;
    participant: User;
    messages: ChatMessage[];
    lastMessage: ChatMessage;
}

export interface SubIdea {
    id: number; 
    title: string;
    description: string;
    author: User;
    createdAt: string;
    votes: number;
    status: 'OPEN_FOR_PROTOTYPING' | 'SELF_PROTOTYPING';
}

export interface Proposal {
  id: number; // Changed to number to align with usage
  subIdeaId: number;
  title: string;
  description: string;
  author: User;
  createdAt: string;
  votes: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  rejectionReason?: string;
  presentationUrl?: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  author: User;
  createdAt: string;
  type: 'IDEATION' | 'SOLUTION_REQUEST';
  status: 'OPEN' | 'CLOSED';
  totalProposals: number;
  totalPrototypes: number;
  potentialDollarValue?: number; // Added this property
  subIdeas?: SubIdea[];
  proposals?: Proposal[];
  prototypes?: Prototype[];
}

export interface Prototype {
  id: string;
  proposalId: string;
  title: string;
  description: string;
  author: User;
  team: User[];
  createdAt: string;
  imageUrl: string;
  liveUrl?: string;
  votes: number;
  comments?: Comment[];
}

// This type is now deprecated in favor of Idea, but kept for compatibility.
export interface Project extends Idea {}


// --- Hackathon Types ---
export interface HackathonPrize {
  rank: string;
  reward: string;
  description: string;
}

export interface HackathonPerson {
  name: string;
  title: string;
  avatarUrl: string;
}

export interface HackathonScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  speaker?: HackathonPerson;
}

export interface HackathonProject {
  id: string;
  name: string;
  tagline: string;
  thumbnailUrl: string;
  team: User[];
}

export interface Hackathon {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  overview: string;
  prizes: HackathonPrize[];
  speakers: HackathonPerson[];
  judges: HackathonPerson[];
  schedule: {
    date: string;
    events: HackathonScheduleItem[];
  }[];
  projects: HackathonProject[];
  timeline: {
    start: string;
    end: string;
  };
  eventDates: {
    start: string;
    end: string;
  };
  prizeAnnouncement: {
    start: string;
    end: string;
  };
}
