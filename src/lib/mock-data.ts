import { User, Post, Comment } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice', avatarUrl: 'https://placehold.co/40x40.png?text=A', stars: 125 },
  { id: 'user-2', name: 'Bob', avatarUrl: 'https://placehold.co/40x40.png?text=B', stars: 98 },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://placehold.co/40x40.png?text=C', stars: 72 },
  { id: 'user-4', name: 'Diana', avatarUrl: 'https://placehold.co/40x40.png?text=D', stars: 150 },
  { id: 'user-5', name: 'Eve', avatarUrl: 'https://placehold.co/40x40.png?text=E', stars: 55 },
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
    createdAt: '4 hours ago',
    votes: 24,
    comments: [comments[0], comments[1]],
  },
  {
    id: 'post-2',
    title: 'The best way to manage state in modern React',
    content: 'This post explores various state management libraries and patterns in React, including Zustand, Redux Toolkit, and React Query. It provides code examples and performance benchmarks to help developers choose the right tool for their project.',
    author: users[3],
    createdAt: '1 day ago',
    votes: 102,
    comments: [comments[2]],
  },
  {
    id: 'post-3',
    title: 'A deep dive into CSS Grid and Flexbox',
    content: 'A comprehensive guide to CSS Grid and Flexbox, explaining the core concepts of each layout module. It includes interactive examples and common use-cases to help readers master modern CSS for responsive web design.',
    author: users[2],
    createdAt: '3 days ago',
    votes: 56,
    comments: [],
  },
];
