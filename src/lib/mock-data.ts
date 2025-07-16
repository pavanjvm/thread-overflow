
import { User, Post, Comment, Community, Notification, ChatMessage, Conversation, Proposal, Prototype, Idea, Hackathon, HackathonPerson, HackathonProject } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice', avatarUrl: 'https://placehold.co/40x40.png?text=A', stars: 125, role: 'admin' },
  { id: 'user-2', name: 'Bob', avatarUrl: 'https://placehold.co/40x40.png?text=B', stars: 98, role: 'user' },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://placehold.co/40x40.png?text=C', stars: 72, role: 'user' },
  { id: 'user-4', name: 'Diana', avatarUrl: 'https://placehold.co/40x40.png?text=D', stars: 150, role: 'user' },
  { id: 'user-5', name: 'Eve', avatarUrl: 'https://placehold.co/40x40.png?text=E', stars: 55, role: 'user' },
];

export const communities: Community[] = [
  { id: 'comm-1', name: 'Tech Talk', slug: 'techtalk', iconUrl: 'https://placehold.co/40x40.png?text=T', coverImageUrl: 'https://placehold.co/1200x300.png', description: 'General discussions about technology, software, and hardware.', members: 12845 },
  { id: 'comm-2', name: 'Investments', slug: 'investments', iconUrl: 'https://placehold.co/40x40.png?text=I', coverImageUrl: 'https://placehold.co/1200x300.png', description: 'A community for discussing stocks, crypto, and other investment strategies.', members: 98321 },
  { id: 'comm-3', name: 'Full-stack Devs', slug: 'fullstack', iconUrl: 'https://placehold.co/40x40.png?text=F', coverImageUrl: 'https://placehold.co/1200x300.png', description: 'For developers who do it all, from front-end to back-end.', members: 45201 },
];

const replyToComment2: Comment = {
  id: 'reply-1',
  content: 'Thanks, that clarifies things! I was stuck on that for a while.',
  author: users[0],
  createdAt: '55 minutes ago',
  votes: 5,
};

export const comments: Comment[] = [
  { id: 'comment-1', content: 'This is a great point, I hadn\'t considered that!', author: users[1], createdAt: '2 hours ago', votes: 12 },
  { id: 'comment-2', content: 'Could you elaborate on the second part? I am not sure I follow.', author: users[2], createdAt: '1 hour ago', votes: 8, replies: [replyToComment2] },
  { id: 'comment-3', content: 'I tried this and it worked perfectly. Thanks for sharing!', author: users[0], createdAt: '30 minutes ago', votes: 25 },
  { id: 'comment-4', content: 'I have a different perspective on this...', author: users[3], createdAt: '4 hours ago', votes: -2 },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    title: 'How to build a Next.js app with Firebase Studio?',
    content: 'Full content of the post about building a Next.js app. It goes into detail about project setup, component creation, styling with Tailwind CSS, and deploying to Firebase. It also covers best practices for server components and data fetching patterns to ensure optimal performance.',
    author: users[0],
    community: communities[0],
    createdAt: '4 hours ago',
    votes: 24,
    comments: [comments[0], comments[1]],
    status: 'published',
  },
  {
    id: 'post-2',
    title: 'The best way to manage state in modern React',
    content: 'This post explores various state management libraries and patterns in React, including Zustand, Redux Toolkit, and React Query. It provides code examples and performance benchmarks to help developers choose the right tool for their project.',
    author: users[3],
    community: communities[1],
    createdAt: '1 day ago',
    votes: 102,
    comments: [comments[2]],
    status: 'published',
  },
  {
    id: 'post-3',
    title: 'A deep dive into CSS Grid and Flexbox',
    content: 'A comprehensive guide to CSS Grid and Flexbox, explaining the core concepts of each layout module. It includes interactive examples and common use-cases to help readers master modern CSS for responsive web design.',
    author: users[2],
    community: communities[2],
    createdAt: '3 days ago',
    votes: 56,
    comments: [],
    status: 'published',
  },
  {
    id: 'post-4',
    title: 'Which frontend framework do you prefer?',
    content: 'There are many great options out there. Let us know which one is your favorite for building modern web apps. If you choose "Other", let us know in the comments!',
    author: users[1],
    community: communities[1],
    createdAt: '2 days ago',
    votes: 42,
    comments: [],
    pollOptions: [
      { text: 'React', votes: 15 },
      { text: 'Vue', votes: 8 },
      { text: 'Svelte', votes: 12 },
      { text: 'Other', votes: 2 },
    ],
    status: 'published',
  },
  {
    id: 'post-5-draft',
    title: 'This is a draft post',
    content: 'I am still working on this brilliant idea... It involves lasers and kittens.',
    author: users[0], 
    community: communities[0],
    createdAt: '10 minutes ago',
    votes: 0,
    comments: [],
    status: 'draft',
  }
];

export const notifications: Notification[] = [
    { id: 'notif-1', text: 'Alice awarded you a star on your comment.', createdAt: '5 minutes ago', read: false, href: '/posts/post-2' },
    { id: 'notif-2', text: 'Your post in c/techtalk is trending!', createdAt: '1 hour ago', read: false, href: '/posts/post-1' },
    { id: 'notif-3', text: 'Charlie replied to your post.', createdAt: '3 hours ago', read: true, href: '/posts/post-1' },
];

const bobMessages: ChatMessage[] = [
    { id: 'msg-1', senderId: 'user-1', receiverId: 'user-2', content: 'Hey Bob, how is it going?', timestamp: '10:30 AM', read: true },
    { id: 'msg-2', senderId: 'user-2', receiverId: 'user-1', content: 'Hey Alice! Going well, just working on that new feature.', timestamp: '10:31 AM', read: true },
    { id: 'msg-3', senderId: 'user-1', receiverId: 'user-2', content: 'Nice! Let me know if you need any help.', timestamp: '10:32 AM', read: true },
    { id: 'msg-4', senderId: 'user-2', receiverId: 'user-1', content: 'Will do, thanks!', timestamp: '10:33 AM', read: false },
];

const charlieMessages: ChatMessage[] = [
    { id: 'msg-5', senderId: 'user-3', receiverId: 'user-1', content: 'Quick question about the CSS Grid post.', timestamp: '11:00 AM', read: true },
    { id: 'msg-6', senderId: 'user-1', receiverId: 'user-3', content: 'Sure, what is it?', timestamp: '11:01 AM', read: true },
];

const dianaMessages: ChatMessage[] = [
    { id: 'msg-7', senderId: 'user-4', receiverId: 'user-1', content: 'Love the app!', timestamp: 'Yesterday', read: true },
];

export const conversations: Conversation[] = [
    {
        id: 'conv-1',
        participant: users[1], // Bob
        messages: bobMessages,
        lastMessage: bobMessages[bobMessages.length - 1],
    },
    {
        id: 'conv-2',
        participant: users[2], // Charlie
        messages: charlieMessages,
        lastMessage: charlieMessages[charlieMessages.length - 1],
    },
    {
        id: 'conv-3',
        participant: users[3], // Diana
        messages: dianaMessages,
        lastMessage: dianaMessages[dianaMessages.length - 1],
    }
];

// --- Ideation Portal Data ---
export const ideas: Idea[] = [
    {
        id: 'proj-1',
        type: 'Solution Request',
        title: 'Build a Real-Time Collaborative Whiteboard',
        description: 'We need a whiteboard app where multiple users can draw and share ideas simultaneously. It should support basic shapes, text, and freeform drawing. The primary challenge is ensuring low latency and synchronized state across all clients.',
        author: users[3], // Diana
        createdAt: '3 days ago',
        status: 'Prototyping',
        proposals: [
          { id: 'prop-1', ideaId: 'proj-1', title: 'Use WebSockets for Real-Time', description: 'Instead of polling, we can use WebSockets (like Socket.IO or a managed service) for instant, bidirectional communication between clients and the server. This will significantly reduce latency.', author: users[1], createdAt: '2 days ago', votes: 18, status: 'Accepted' },
          { id: 'prop-2', ideaId: 'proj-1', title: 'Leverage CRDTs for Conflict-Free Syncing', description: 'Conflict-Free Replicated Data Types (CRDTs) are a data structure that can be updated independently and concurrently without coordination, and then merged automatically. This would be perfect for managing the state of the whiteboard.', author: users[2], createdAt: '2 days ago', votes: 12, status: 'Rejected', comments: 'Great idea, but might be too complex for the initial prototype.' },
        ],
        prototypes: [
          { id: 'proto-1', proposalId: 'prop-1', title: 'WebSocket Proof-of-Concept', description: 'A working prototype using Socket.io to demonstrate real-time communication. Multiple browser windows can connect and see drawings update live.', author: users[1], team: [users[1], users[0]], createdAt: '1 day ago', imageUrl: 'https://placehold.co/600x400.png', liveUrl: '#', votes: 10, comments: [comments[2], comments[3]] },
        ],
    },
    {
        id: 'proj-2',
        type: 'Ideation',
        title: 'AI-Powered Recipe Generator',
        description: 'Create an application that suggests recipes based on the ingredients a user has in their fridge. The AI should be able to handle substitutions and dietary restrictions. The user should be able to input ingredients via text or by uploading a photo.',
        author: users[0], // Alice
        createdAt: '1 week ago',
        status: 'Open for prototyping',
        proposals: [
          { id: 'prop-3', ideaId: 'proj-2', title: 'Use a Vision API for Ingredient Detection', description: 'We can use an existing Vision API to analyze photos of a user\'s fridge or pantry to automatically detect ingredients, making the input process much easier.', author: users[4], createdAt: '4 days ago', votes: 25, status: 'Pending' },
        ],
        prototypes: [],
    },
    {
        id: 'proj-3',
        type: 'Ideation',
        title: 'Gamified Fitness Challenge App',
        description: 'An app that allows friends to create fitness challenges (e.g., run 50km in a month) and track their progress. It should include leaderboards, badges, and social sharing features to keep users motivated.',
        author: users[2], // Charlie
        createdAt: '2 weeks ago',
        status: 'Completed',
        proposals: [],
        prototypes: [],
    },
     {
        id: 'proj-4',
        type: 'Solution Request',
        title: 'Personal Finance Dashboard',
        description: 'I want to build a dashboard that connects to my bank accounts and credit cards to give me a unified view of my finances. It should automatically categorize my spending.',
        author: users[4], // Diana
        createdAt: '5 days ago',
        status: 'Self-prototyping',
        proposals: [],
        prototypes: [],
    },
];

// Re-export `ideas` as `projects` for any components that haven't been updated yet.
export const projects = ideas;

// --- Hackathon Data ---

const speakers: HackathonPerson[] = [
    { name: 'Grace Hopper', title: 'Rear Admiral, U.S. Navy', avatarUrl: 'https://placehold.co/128x128.png?text=GH' },
    { name: 'Linus Torvalds', title: 'Creator of Linux', avatarUrl: 'https://placehold.co/128x128.png?text=LT' },
    { name: 'Ada Lovelace', title: 'First Computer Programmer', avatarUrl: 'https://placehold.co/128x128.png?text=AL' },
    { name: 'Satoshi Nakamoto', title: 'Creator of Bitcoin', avatarUrl: 'https://placehold.co/128x128.png?text=SN' },
];

const judges: HackathonPerson[] = [
    { name: 'Margaret Hamilton', title: 'Lead Apollo Flight Software Engineer', avatarUrl: 'https://placehold.co/128x128.png?text=MH' },
    { name: 'Vint Cerf', title: '"Father of the Internet"', avatarUrl: 'https://placehold.co/128x128.png?text=VC' },
];

const hackathonProjects: HackathonProject[] = [
    { id: 'hp-1', name: 'AI-Doc', tagline: 'Your personal AI health assistant.', thumbnailUrl: 'https://placehold.co/600x400.png', team: [users[0], users[1]] },
    { id: 'hp-2', name: 'EcoTracker', tagline: 'Monitor and reduce your carbon footprint.', thumbnailUrl: 'https://placehold.co/600x400.png', team: [users[2], users[3]] },
];

export const hackathons: Hackathon[] = [
    {
        id: 'hack-1',
        slug: 'ai-for-good-2025',
        title: 'AI for Good Hackathon 2025',
        subtitle: 'Build innovative AI projects to solve real-world problems.',
        coverImageUrl: 'https://placehold.co/1600x400.png',
        overview: 'The AI for Good Hackathon is a hybrid event where developers, designers, and innovators come together to create solutions for social and environmental challenges using artificial intelligence. Participants first apply with their ideas. Accepted teams will participate in an online hacking period, culminating in an offline event for final reviews and prize distribution. This year, we are focusing on healthcare, education, and sustainability.',
        prizes: [
            { rank: '1st Place', reward: '10,000 Points', description: 'Awarded to the most innovative and impactful project.' },
            { rank: '2nd Place', reward: '5,000 Points', description: 'Awarded to the project with the best technical implementation.' },
            { rank: '3rd Place', reward: '2,500 Points', description: 'Awarded to the project with the best user experience.' },
        ],
        speakers,
        judges,
        schedule: [
            {
                date: 'Key Dates',
                events: [
                    { id: 'se-1', time: '17 Mar', title: 'Registration Opens', description: 'Submit your ideas and form your teams.' },
                    { id: 'se-2', time: '17 Apr', title: 'Registration Ends', description: 'Final day for applications.' },
                    { id: 'se-3', time: '18 Apr', title: 'Hacking Period Starts', description: 'Accepted teams can start building their prototypes online.'},
                    { id: 'se-4', time: '10 Jun', title: 'Project Submission Deadline', description: 'Submit your final project for review.'},
                    { id: 'se-5', time: '11 Jun', title: 'Offline Demos & Awards', description: 'In-person project demos, judging, and prize ceremony.'},
                ]
            }
        ],
        projects: hackathonProjects,
        timeline: { start: '17 Mar', end: '17 Apr' },
        eventDates: { start: '18 Apr', end: '10 Jun' },
        prizeAnnouncement: { start: '11 Jun', end: '11 Jun' },
    }
];
