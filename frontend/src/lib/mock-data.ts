
import { User, Post, Comment, Community, Notification, ChatMessage, Conversation, Proposal, Prototype, Idea, SubIdea, Hackathon, HackathonPerson, HackathonProject } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice', avatarUrl: 'https://placehold.co/40x40.png?text=A', stars: 125, role: 'ADMIN' },
  { id: 'user-2', name: 'Bob', avatarUrl: 'https://placehold.co/40x40.png?text=B', stars: 98, role: 'USER' },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://placehold.co/40x40.png?text=C', stars: 72, role: 'USER' },
  { id: 'user-4', name: 'Diana', avatarUrl: 'https://placehold.co/40x40.png?text=D', stars: 150, role: 'USER' },
  { id: 'user-5', name: 'Eve', avatarUrl: 'https://placehold.co/40x40.png?text=E', stars: 55, role: 'USER' },
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
    {
      id: 'comment-1',
      content: "This is a great point, I hadn't considered that!",
      author: users[1],
      createdAt: '2 hours ago',
      votes: 12
    },
    {
      id: 'comment-2',
      content: 'Could you elaborate on the second part? I am not sure I follow.',
      author: users[2],
      createdAt: '1 hour ago',
      votes: 8,
      replies: [replyToComment2]
    },
    {
      id: 'comment-3',
      content: 'I tried this and it worked perfectly. Thanks for sharing!',
      author: users[0],
      createdAt: '30 minutes ago',
      votes: 25
    },
    {
      id: 'comment-4',
      content: 'I have a different perspective on this...',
      author: users[3],
      createdAt: '4 hours ago',
      votes: -2
    }
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

const subIdeasForProject1: SubIdea[] = [
  {
    id: 'sub-idea-1',
    title: 'Use WebSockets for real-time updates',
    description: 'Instead of polling, we should use WebSockets for instant communication between clients. This will reduce latency and server load.',
    author: users[1], // Bob
    createdAt: '2 days ago',
    votes: 15,
    status: 'OPEN_FOR_PROTOTYPING',
  },
  {
    id: 'sub-idea-2',
    title: 'Add a "presenter mode"',
    description: 'A mode where one user controls the main view for everyone else, which would be great for guided presentations or teaching.',
    author: users[2], // Charlie
    createdAt: '1 day ago',
    votes: 8,
    status: 'SELF_PROTOTYPING',
  }
];

const proposalsForProject1: Proposal[] = [
    {
        id: 'prop-1',
        subIdeaId: 'sub-idea-1',
        title: 'Proposal for WebSocket Implementation',
        description: 'Detailed plan to integrate a WebSocket server and client-side logic using Socket.io for the collaborative whiteboard.',
        authorId: users[1].id,
        author: users[1], // Bob
        createdAt: '1 day ago',
        votes: 10,
        status: 'PENDING',
        presentationUrl: '#',
    },
    {
        id: 'prop-2',
        subIdeaId: 'sub-idea-1',
        title: 'Alternative: Using Server-Sent Events',
        description: 'A simpler approach using SSE for one-way communication from server to client, which might be sufficient for our needs.',
        authorId: users[2].id,
        author: users[2], // Charlie
        createdAt: '20 hours ago',
        votes: 4,
        status: 'REJECTED',
        rejectionReason: 'Good idea, but we need two-way communication for this project.',
        presentationUrl: '#',
    },
    {
        id: 'prop-3',
        subIdeaId: 'sub-idea-1',
        title: 'Full-Featured Real-Time Solution',
        description: 'A comprehensive proposal leveraging LiveKit for a robust, scalable real-time backend.',
        authorId: users[0].id,
        author: users[0], // Alice
        createdAt: '15 hours ago',
        votes: 22,
        status: 'ACCEPTED',
        presentationUrl: '#',
    }
];

const prototypesForProject1: Prototype[] = [
  {
    id: 'proto-1',
    proposalId: 'prop-3',
    title: 'LiveKit Whiteboard Demo',
    description: 'A working prototype demonstrating real-time collaboration using LiveKit. It supports multiple cursors, basic shapes, and text.',
    authorId: users[0].id,
    author: users[0], // Alice
    team: [users[0]],
    createdAt: '2 hours ago',
    imageUrl: 'https://placehold.co/800x450.png',
    liveUrl: '#',
    votes: 18,
    comments: [comments[0]],
  },
];


const subIdeasForProject2: SubIdea[] = [
    {
        id: 'sub-idea-3',
        title: 'Ingredient Image Recognition',
        description: 'Use the device camera to take a picture of ingredients and have an AI model identify them automatically.',
        author: users[4], // Eve
        createdAt: '3 days ago',
        votes: 28,
        status: 'OPEN_FOR_PROTOTYPING',
    },
    {
        id: 'sub-idea-4',
        title: 'Meal Planning Integration',
        description: 'Allow users to generate a meal plan for the week based on their available ingredients, and create a shopping list for missing items.',
        author: users[1], // Bob
        createdAt: '2 days ago',
        votes: 19,
        status: 'OPEN_FOR_PROTOTYPING',
    }
];

const proposalsForProject2: Proposal[] = [
    {
        id: 'prop-4',
        subIdeaId: 'sub-idea-3',
        title: 'TensorFlow.js for On-Device Recognition',
        description: 'We can use a pre-trained MobileNet model with TensorFlow.js to perform ingredient recognition directly on the user\'s device, ensuring privacy and offline functionality.',
        authorId: users[4].id,
        author: users[4], // Eve
        createdAt: '1 day ago',
        votes: 12,
        status: 'ACCEPTED',
        presentationUrl: '#'
      },
    {
        id: 'prop-5',
        subIdeaId: 'sub-idea-4',
        title: 'Weekly Meal Planner API',
        description: 'Build a backend service that takes a list of ingredients and dietary preferences, and returns a structured 7-day meal plan.',
        authorId: users[2].id,
        author: users[2], // Charlie
        createdAt: '12 hours ago',
        votes: 5,
        status: 'PENDING',
        presentationUrl: '#',
    }
];

const prototypesForProject2: Prototype[] = [
    {
        id: 'proto-2',
        proposalId: 'prop-4',
        title: 'Ingredient Scanner PWA',
        description: 'A progressive web app that lets you snap a photo of your food items. It correctly identifies about 80% of common vegetables and fruits.',
        authorId: users[4].id,
        author: users[4], // Eve
        team: [users[4], users[0]],
        createdAt: '3 hours ago',
        imageUrl: 'https://placehold.co/800x450.png',
        liveUrl: '#',
        votes: 9,
        comments: [],
    }
];

const subIdeasForProject3: SubIdea[] = [
    {
        id: 'sub-idea-5',
        title: 'Strava & Wearables Integration',
        description: 'Allow users to automatically sync their activities from Strava, Apple Watch, and Fitbit to track progress in challenges.',
        author: users[3],
        createdAt: '4 days ago',
        votes: 42,
        status: 'OPEN_FOR_PROTOTYPING',
    }
];


export const ideas: Idea[] = [
    {
        id: 'proj-1',
        title: 'Real-Time Collaborative Whiteboard',
        description: 'A whiteboard app where multiple users can draw and share ideas simultaneously. It should support basic shapes, text, and freeform drawing.',
        author: users[3], // Diana is the project owner
        authorId: users[3].id,
        createdAt: '3 days ago',
        type: 'IDEATION',
        status: 'OPEN',
        totalProposals: proposalsForProject1.length,
        totalPrototypes: prototypesForProject1.length,
        potentialDollarValue: 75000,
        subIdeas: subIdeasForProject1,
        proposals: proposalsForProject1,
        prototypes: prototypesForProject1,
    },
    {
        id: 'proj-2',
        title: 'AI-Powered Recipe Generator',
        description: 'An application that suggests recipes based on the ingredients a user has in their fridge. The AI should be able to handle substitutions and dietary restrictions.',
        author: users[0], // Alice
        authorId: users[0].id,
        createdAt: '1 week ago',
        type: 'SOLUTION_REQUEST',
        status: 'OPEN',
        totalProposals: proposalsForProject2.length,
        totalPrototypes: prototypesForProject2.length,
        subIdeas: subIdeasForProject2,
        proposals: proposalsForProject2,
        prototypes: prototypesForProject2,
    },
    {
        id: 'proj-3',
        title: 'Gamified Fitness Challenge App',
        description: 'An app that allows friends to create fitness challenges (e.g., run 50km in a month) and track their progress. It should include leaderboards and badges.',
        author: users[2], // Charlie
        authorId: users[2].id,
        createdAt: '2 weeks ago',
        type: 'IDEATION',
        status: 'CLOSED',
        totalProposals: 0,
        totalPrototypes: 0,
        potentialDollarValue: 50000,
        subIdeas: subIdeasForProject3,
        proposals: [],
        prototypes: [],
    },
     {
        id: 'proj-4',
        title: 'Personal Finance Dashboard',
        description: 'A dashboard that connects to bank accounts and credit cards to give a unified view of finances and automatically categorize spending.',
        author: users[4], // Eve
        authorId: users[4].id,
        createdAt: '5 days ago',
        type: 'SOLUTION_REQUEST',
        status: 'OPEN',
        totalProposals: 0,
        totalPrototypes: 0,
        subIdeas: [],
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

const enterpriseProjects: HackathonProject[] = [
    {
        id: 'hp-1',
        name: 'PulseOps',
        tagline: 'Incident copilots for enterprise SRE teams.',
        thumbnailUrl: 'https://placehold.co/600x400.png',
        team: [users[0], users[1]],
        stage: 'Final Showcase',
        score: '91.4',
        status: 'Jury Review',
        summary: 'Automates incident triage, postmortems, and on-call handoffs for high-severity alerts.'
    },
    {
        id: 'hp-2',
        name: 'EcoLedger',
        tagline: 'Supply-chain carbon reporting for procurement teams.',
        thumbnailUrl: 'https://placehold.co/600x400.png',
        team: [users[2], users[3]],
        stage: 'Prototype Sprint',
        score: '87.2',
        status: 'Shortlisted',
        summary: 'Maps supplier emissions and produces audit-ready sustainability reports for RFP cycles.'
    },
    {
        id: 'hp-3',
        name: 'CareRoute AI',
        tagline: 'Patient navigation built for overstretched hospital ops.',
        thumbnailUrl: 'https://placehold.co/600x400.png',
        team: [users[4], users[1]],
        stage: 'Final Showcase',
        score: '89.8',
        status: 'Mentor Pick',
        summary: 'Reduces no-shows and fragmented care journeys with a multilingual patient routing assistant.'
    },
];

export const hackathons: Hackathon[] = [
    {
        id: 'hack-1',
        slug: 'enterprise-innovation-sprint',
        title: 'Enterprise Innovation Sprint',
        subtitle: 'A staged enterprise hackathon OS for sourcing, mentoring, evaluating, and converting teams.',
        theme: 'Enterprise AI + Automation',
        format: 'Hybrid, 5-stage program',
        audience: 'Students, startups, working professionals, solution teams',
        status: 'LIVE',
        coverImageUrl: 'https://placehold.co/1600x400.png',
        overview: 'This workspace is designed like a serious hackathon hosting platform rather than a brochure site. Clients define challenge statements, evaluation rubrics, SLAs, and funnel targets. Participants move through structured stages, receive mentor touchpoints, submit deliverables, and get ranked against transparent scorecards. The platform tracks the entire lifecycle from registrations to shortlisted teams, final showcases, and post-program hiring or pilot conversion.',
        prizes: [
            { rank: 'Champion', reward: '$18,000 + Pilot Grant', description: 'For the strongest enterprise-ready solution with business validation.' },
            { rank: 'Runner Up', reward: '$9,000 + Fast-track interviews', description: 'For the team with the best combination of execution and customer fit.' },
            { rank: 'Jury Choice', reward: '$4,000 + Advisory Sessions', description: 'For the boldest concept with standout differentiation.' },
        ],
        speakers,
        judges,
        schedule: [
            {
                date: 'Program Timeline',
                events: [
                    { id: 'se-1', time: '02 Jun', title: 'Applications Open', description: 'Participants register, pick tracks, and access prep content.' },
                    { id: 'se-2', time: '18 Jun', title: 'Screening + Shortlist', description: 'Auto-scoring plus manual review create the live cohort.' },
                    { id: 'se-3', time: '21 Jun', title: 'Mentor Sprint', description: 'Teams enter challenge rooms, office hours, and checkpoint reviews.'},
                    { id: 'se-4', time: '03 Jul', title: 'Prototype Lock', description: 'Final demos, pitch decks, and evidence packs are submitted.'},
                    { id: 'se-5', time: '07 Jul', title: 'Client Showcase', description: 'Judges, clients, and hiring panels review finalists and next steps.'},
                ]
            }
        ],
        projects: enterpriseProjects,
        stages: [
            {
                id: 'stage-1',
                name: 'Applications',
                window: '02 Jun - 18 Jun',
                status: 'COMPLETED',
                owner: 'Program Ops',
                completion: 100,
                objective: 'Acquire and qualify the right mix of builders across problem statements.',
                deliverables: ['Profile completion', 'Track selection', 'Skill evidence or portfolio'],
                analytics: { submissions: '2,486 applications', conversion: '100% captured', sla: 'Lead response < 6h' }
            },
            {
                id: 'stage-2',
                name: 'Shortlist Review',
                window: '19 Jun - 20 Jun',
                status: 'COMPLETED',
                owner: 'Client + Jury',
                completion: 100,
                objective: 'Move the strongest teams into mentor-backed build sprints.',
                deliverables: ['Screening scorecards', 'Client approval queues', 'Cohort announcements'],
                analytics: { submissions: '320 shortlisted', conversion: '12.9%', sla: 'Decision cycle 36h' }
            },
            {
                id: 'stage-3',
                name: 'Mentor Sprint',
                window: '21 Jun - 30 Jun',
                status: 'ACTIVE',
                owner: 'Mentor Ops',
                completion: 64,
                objective: 'Drive weekly progress through checkpoints, office hours, and risk tracking.',
                deliverables: ['Problem framing memo', 'Architecture draft', 'Checkpoint recording'],
                analytics: { submissions: '214 active teams', conversion: '66.8%', sla: 'Mentor assignment 12h' }
            },
            {
                id: 'stage-4',
                name: 'Prototype Lock',
                window: '01 Jul - 03 Jul',
                status: 'UPCOMING',
                owner: 'Submission Desk',
                completion: 0,
                objective: 'Collect final demos with complete evidence packs for fair judging.',
                deliverables: ['Demo video', 'Pitch deck', 'Prototype URL', 'Team summary'],
                analytics: { submissions: '0 locked', conversion: 'Target 85%', sla: 'Submission review same day' }
            },
            {
                id: 'stage-5',
                name: 'Showcase + Conversion',
                window: '07 Jul',
                status: 'UPCOMING',
                owner: 'Client Success',
                completion: 0,
                objective: 'Select winners and convert top teams into pilots, internships, or interviews.',
                deliverables: ['Final scorecards', 'Offer notes', 'Pilot recommendations'],
                analytics: { submissions: '0 reviewed', conversion: 'Target 12 offers', sla: 'Outcome note in 24h' }
            }
        ],
        participantWorkspace: {
            eligibility: ['Open to individuals or teams of up to 4', 'At least one builder per team', 'Submissions in English', 'Prototype must map to a listed enterprise problem'],
            perks: ['Weekly mentor office hours', 'Client AMAs', 'Fast-track hiring interviews', 'Pilot and grant opportunities'],
            toolkit: ['Challenge briefs', 'Rubric templates', 'Pitch deck template', 'Checkpoint review recordings'],
            tracks: [
                {
                    id: 'track-1',
                    title: 'Enterprise AI Ops',
                    description: 'Automation, copilots, observability workflows, and operational intelligence.',
                    stage: 'Mentor Sprint',
                    deliverable: 'Checkpoint memo + architecture plan',
                    dueBy: '28 Jun, 11:59 PM',
                    teamStatus: 'On track'
                },
                {
                    id: 'track-2',
                    title: 'Sustainability + Procurement',
                    description: 'Supplier intelligence, reporting automation, and carbon-risk transparency.',
                    stage: 'Mentor Sprint',
                    deliverable: 'Prototype storyboard + metrics plan',
                    dueBy: '29 Jun, 6:00 PM',
                    teamStatus: 'Needs mentor review'
                },
                {
                    id: 'track-3',
                    title: 'Healthcare Ops',
                    description: 'Staff productivity, patient routing, and care-coordination tooling.',
                    stage: 'Shortlisted',
                    deliverable: 'Team intro and problem statement',
                    dueBy: 'Live now',
                    teamStatus: 'Ready to build'
                }
            ],
            leaderboard: [
                { rank: '01', teamName: 'PulseOps', score: '91.4', highlight: 'Best checkpoint quality this week' },
                { rank: '02', teamName: 'CareRoute AI', score: '89.8', highlight: 'Top mentor confidence index' },
                { rank: '03', teamName: 'EcoLedger', score: '87.2', highlight: 'Strongest business viability' },
            ]
        },
        clientWorkspace: {
            sponsor: 'Northstar Enterprise Labs',
            objective: 'Source implementation-ready teams and identify 3 pilot candidates across automation, healthcare, and procurement.',
            serviceTier: 'Managed Hackathon Program',
            metrics: [
                { label: 'Qualified applicants', value: '2,486', delta: '+18% vs target', trend: 'up', helperText: 'Captured across 42 campuses and 11 startup communities' },
                { label: 'Shortlisted teams', value: '320', delta: '12.9% conversion', trend: 'neutral', helperText: 'Balanced by skill, geography, and challenge preference' },
                { label: 'Mentor sessions booked', value: '486', delta: '94% attendance', trend: 'up', helperText: 'Operations SLA within 12 hours' },
                { label: 'Hiring / pilot intent', value: '17', delta: '+5 this week', trend: 'up', helperText: 'Signals from judges and business owners' },
            ],
            pipeline: [
                { label: 'Registrations', volume: '4,812', conversion: '100%', insight: 'Acquisition strongest from campus and creator channels' },
                { label: 'Qualified applications', volume: '2,486', conversion: '51.6%', insight: 'Portfolio completion gating improved lead quality' },
                { label: 'Shortlisted teams', volume: '320', conversion: '12.9%', insight: 'Client scoring aligned with rubric bands' },
                { label: 'Active builds', volume: '214', conversion: '66.8%', insight: 'Drop-offs mostly from incomplete team setup' },
                { label: 'Finalist targets', volume: '24', conversion: '11.2%', insight: 'Expected mix across all three tracks' },
            ],
            opsChecklist: [
                'Approve remaining 6 mentor allocations',
                'Publish prototype lock submission checklist',
                'Finalize judge roster for healthcare track',
                'Prepare offer / pilot decision templates'
            ],
            judgePanelNotes: [
                'Enterprise AI Ops teams are outperforming on execution but need stronger ROI framing.',
                'Healthcare track has the highest mentor demand and longest review cycles.',
                'Three teams already meet minimum bar for procurement pilot exploration.'
            ]
        },
        analytics: {
            headline: [
                { label: 'Application to shortlist', value: '12.9%', delta: '+2.1 pts', trend: 'up' },
                { label: 'Mentor utilization', value: '94%', delta: 'Healthy', trend: 'up' },
                { label: 'Checkpoint completion', value: '64%', delta: 'In sprint', trend: 'neutral' },
                { label: 'Offer / pilot intent', value: '17', delta: '+5', trend: 'up' }
            ],
            geography: [
                { region: 'Bengaluru', share: '28%' },
                { region: 'Hyderabad', share: '19%' },
                { region: 'Pune', share: '16%' },
                { region: 'Delhi NCR', share: '14%' },
                { region: 'Remote / Global', share: '23%' }
            ],
            funnel: [
                { stage: 'Registrations', value: '4,812' },
                { stage: 'Completed apps', value: '2,486' },
                { stage: 'Shortlisted', value: '320' },
                { stage: 'Active teams', value: '214' },
                { stage: 'Target finalists', value: '24' }
            ],
            engagement: [
                { label: 'Average mentor rating', value: '4.7/5' },
                { label: 'Community messages', value: '1,982' },
                { label: 'Avg. deck review turnaround', value: '7.4h' },
                { label: 'Submission completeness', value: '88%' }
            ]
        },
        timeline: { start: '02 Jun', end: '18 Jun' },
        eventDates: { start: '21 Jun', end: '07 Jul' },
        prizeAnnouncement: { start: '07 Jul', end: '07 Jul' },
    },
    {
        id: 'hack-2',
        slug: 'campus-launchpad-open',
        title: 'Campus Launchpad Open',
        subtitle: 'A participant-heavy program for colleges and early builders, with sponsor-ready analytics for partner brands.',
        theme: 'Student Innovation + GTM Experiments',
        format: 'Online, 4-stage sprint',
        audience: 'College students, clubs, first-time founders',
        status: 'REVIEW',
        coverImageUrl: 'https://placehold.co/1600x400.png',
        overview: 'Campus Launchpad Open is a lighter-weight program optimized for volume, discovery, and employer branding. Participants get structured tracks and easy onboarding, while clients get funnel analytics, campus penetration reports, and judge-ready finalist boards.',
        prizes: [
            { rank: 'Top Team', reward: '$7,500', description: 'Highest combined innovation and implementation score.' },
            { rank: 'Best Campus Team', reward: '$2,500', description: 'Best team emerging from the student cohort.' },
            { rank: 'Brand Favourite', reward: '$1,500', description: 'Most aligned with sponsor strategy and storytelling.' },
        ],
        speakers,
        judges,
        schedule: [
            {
                date: 'Sprint Calendar',
                events: [
                    { id: 'cl-1', time: '12 Aug', title: 'Kickoff', description: 'Orientation, track selection, and starter kits.' },
                    { id: 'cl-2', time: '16 Aug', title: 'Mentor Jam', description: 'Rapid checkpoints and team debugging sessions.' },
                    { id: 'cl-3', time: '22 Aug', title: 'Prototype Review', description: 'Rubric scoring and shortlist confirmation.' },
                    { id: 'cl-4', time: '24 Aug', title: 'Final Showcase', description: 'Live demos for partners and campus leaders.' },
                ]
            }
        ],
        projects: enterpriseProjects.slice(0, 2),
        stages: [
            {
                id: 'campus-stage-1',
                name: 'Open Registration',
                window: '01 Aug - 11 Aug',
                status: 'COMPLETED',
                owner: 'Campus Ops',
                completion: 100,
                objective: 'Drive broad registration volume and convert discoverability into complete team entries.',
                deliverables: ['Campus referral codes', 'Track preference', 'Resume links'],
                analytics: { submissions: '6,140 registrations', conversion: '100%', sla: 'Auto confirmation' }
            },
            {
                id: 'campus-stage-2',
                name: 'Build Sprint',
                window: '12 Aug - 20 Aug',
                status: 'COMPLETED',
                owner: 'Program Mentors',
                completion: 100,
                objective: 'Help first-time teams ship prototypes with fast feedback loops.',
                deliverables: ['Problem framing', 'Prototype video', 'Pitch draft'],
                analytics: { submissions: '840 active teams', conversion: '13.7%', sla: 'Mentor response 8h' }
            },
            {
                id: 'campus-stage-3',
                name: 'Review Board',
                window: '21 Aug - 23 Aug',
                status: 'ACTIVE',
                owner: 'Client Reviewers',
                completion: 72,
                objective: 'Score prototypes, shortlist finalists, and tag standout talent for partner teams.',
                deliverables: ['Rubric sheets', 'Judge remarks', 'Final shortlist'],
                analytics: { submissions: '96 finalists', conversion: '11.4%', sla: 'Review turnaround 14h' }
            },
            {
                id: 'campus-stage-4',
                name: 'Showcase',
                window: '24 Aug',
                status: 'UPCOMING',
                owner: 'Client Success',
                completion: 0,
                objective: 'Announce winners, capture hiring signals, and publish sponsor reports.',
                deliverables: ['Winner deck', 'Hiring notes', 'Brand performance report'],
                analytics: { submissions: 'Pending', conversion: 'Target 8 offers', sla: 'Same-day wrap-up' }
            }
        ],
        participantWorkspace: {
            eligibility: ['Open to current students and recent graduates', 'Solo and team participation supported', 'No prior hackathon experience required'],
            perks: ['Starter kits', 'Rapid mentoring', 'Campus leaderboard', 'Brand certificate'],
            toolkit: ['Problem bank', 'Pitch starter', 'Resume workshop replay'],
            tracks: [
                { id: 'campus-track-1', title: 'Student Productivity', description: 'Build tools for campus life and routines.', stage: 'Review Board', deliverable: 'Prototype demo', dueBy: 'Submitted', teamStatus: 'Under review' },
                { id: 'campus-track-2', title: 'Creator Commerce', description: 'Solve monetization and community growth problems.', stage: 'Review Board', deliverable: 'Pitch video', dueBy: 'Submitted', teamStatus: 'Under review' },
            ],
            leaderboard: [
                { rank: '01', teamName: 'DormLoop', score: '88.1', highlight: 'Top peer voting score' },
                { rank: '02', teamName: 'ClubMint', score: '86.3', highlight: 'Best GTM clarity' },
                { rank: '03', teamName: 'StudySprint', score: '85.7', highlight: 'Highest judge consistency' },
            ]
        },
        clientWorkspace: {
            sponsor: 'Launchpad Partner Network',
            objective: 'Drive campus brand reach while identifying high-potential early talent and startup ideas.',
            serviceTier: 'Volume Discovery Program',
            metrics: [
                { label: 'Registrations', value: '6,140', delta: '+31% vs last cohort', trend: 'up' },
                { label: 'Campus partners', value: '64', delta: '+12 new campuses', trend: 'up' },
                { label: 'Review load closed', value: '72%', delta: 'On track', trend: 'neutral' },
                { label: 'Employer interest tags', value: '43', delta: '+9 in 48h', trend: 'up' },
            ],
            pipeline: [
                { label: 'Registrations', volume: '6,140', conversion: '100%', insight: 'Strongest traction from campus ambassadors' },
                { label: 'Teams activated', volume: '840', conversion: '13.7%', insight: 'Starter templates improved build-start rate' },
                { label: 'Finalists', volume: '96', conversion: '11.4%', insight: 'Most finalists from productivity track' },
                { label: 'Hiring intent', volume: '43', conversion: '44.8%', insight: 'Partner companies requested talent sheets' },
            ],
            opsChecklist: ['Finish final rubric calibration', 'Schedule closing keynote', 'Export sponsor insight deck'],
            judgePanelNotes: ['Creator Commerce has strongest storytelling but weaker technical depth.', 'Student Productivity track has the most sponsor-ready concepts.']
        },
        analytics: {
            headline: [
                { label: 'Campus penetration', value: '64 campuses', delta: '+23%', trend: 'up' },
                { label: 'Activation rate', value: '13.7%', delta: '+1.8 pts', trend: 'up' },
                { label: 'Review closure', value: '72%', delta: 'In progress', trend: 'neutral' },
                { label: 'Employer signals', value: '43', delta: '+9', trend: 'up' }
            ],
            geography: [
                { region: 'South India', share: '34%' },
                { region: 'West India', share: '25%' },
                { region: 'North India', share: '21%' },
                { region: 'East India', share: '12%' },
                { region: 'International', share: '8%' }
            ],
            funnel: [
                { stage: 'Registrations', value: '6,140' },
                { stage: 'Activated teams', value: '840' },
                { stage: 'Review board', value: '96' },
                { stage: 'Target winners', value: '12' }
            ],
            engagement: [
                { label: 'Checkpoint attendance', value: '91%' },
                { label: 'Ambassador referrals', value: '1,204' },
                { label: 'Average review cycle', value: '11.2h' },
                { label: 'Sponsor deck exports', value: '18' }
            ]
        },
        timeline: { start: '01 Aug', end: '11 Aug' },
        eventDates: { start: '12 Aug', end: '24 Aug' },
        prizeAnnouncement: { start: '24 Aug', end: '24 Aug' },
    }
];
