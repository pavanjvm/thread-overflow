import { posts, users } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';

export default function DraftsPage() {
  // For prototype purposes, assume the logged-in user is the first user.
  const currentUser = users[0];
  const draftPosts = posts.filter(
    (post) => post.author.id === currentUser.id && post.status === 'draft'
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        My Drafts
      </h1>
      <div className="grid gap-6">
        {draftPosts.length > 0 ? (
          draftPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-muted-foreground">You have no saved drafts.</p>
        )}
      </div>
    </div>
  );
}
