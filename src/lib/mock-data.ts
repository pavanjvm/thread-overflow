import { User, Post, Comment, Community, Notification } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice', avatarUrl: 'https://placehold.co/40x40.png?text=A', stars: 125 },
  { id: 'user-2', name: 'Bob', avatarUrl: 'https://placehold.co/40x40.png?text=B', stars: 98 },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://placehold.co/40x40.png?text=C', stars: 72 },
  { id: 'user-4', name: 'Diana', avatarUrl: 'https://placehold.co/40x40.png?text=D', stars: 150 },
  { id: 'user-5', name: 'Eve', avatarUrl: 'https://placehold.co/40x40.png?text=E', stars: 55 },
];

export const communities: Community[] = [
  { id: 'comm-1', name: 'Next.js', slug: 'nextjs', iconUrl: 'https://placehold.co/40x40.png?text=N', coverImageUrl: 'https://placehold.co/1200x300.png', description: 'The official community for Next.js enthusiasts. Discuss features, ask questions, and share your projects.', members: 12845 },
  { id: 'comm-2', name: 'React', slug: 'react', iconUrl: 'https://placehold.co/40x40.png?text=R', coverImageUrl: 'https://placehold.co/1200x300.png', description: 'A community for learning and developing with React. All skill levels are welcome.', members: 98321 },
  { id: 'comm-3', name: 'CSS', slug: 'css', iconUrl: 'https://placehold.co/40x40.png?text=C', coverImageUrl: 'https://placehold.co/1200x300.png', description: 'All things CSS! From basic styling to advanced animations and layout techniques.', members: 45201 },
];

export const comments: Comment[] = [
  { id: 'comment-1', content: 'This is a great point, I hadn\'t considered that!', author: users[1], createdAt: '2 hours ago', stars: 2 },
  { id: 'comment-2', content: 'Could you elaborate on the second part? I am not sure I follow.', author: users[2], createdAt: '1 hour ago', stars: 1 },
  { id: 'comment-3', content: 'I tried this and it worked perfectly. Thanks for sharing!', author: users[0], createdAt: '30 minutes ago', stars: 3 },
  { id: 'comment-4', content: 'I have a different perspective on this...', author: users[3], createdAt: '4 hours ago', stars: 0 },
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
    availableStars: 10,
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
    availableStars: 10,
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
    availableStars: 10,
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
    availableStars: 10,
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
    availableStars: 10,
    status: 'draft',
  }
];

export const notifications: Notification[] = [
    { id: 'notif-1', text: 'Alice awarded you a star on your comment.', createdAt: '5 minutes ago', read: false, href: '/posts/post-2' },
    { id: 'notif-2', text: 'Your post in c/nextjs is trending!', createdAt: '1 hour ago', read: false, href: '/posts/post-1' },
    { id: 'notif-3', text: 'Charlie replied to your post.', createdAt: '3 hours ago', read: true, href: '/posts/post-1' },
];
