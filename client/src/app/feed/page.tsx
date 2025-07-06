import { posts } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';

export default function FeedPage() {
  const publishedPosts = posts.filter(post => post.status !== 'draft');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        All Posts
      </h1>
      <div className="grid gap-6">
        {publishedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
